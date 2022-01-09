//
// Format
//

import { Field } from "./Field";
import { FieldDefinition, OptionalFieldDefinition } from "./FieldDefinition";
import { Record } from "./Record";
import { RecordDefinition } from "./RecordDefinition";
import { RepeatedRecordDefinition } from "./RepeatedRecordDefinition";
import { ArrayBufferHelper } from "./ArrayBufferHelper";

export enum ByteOrder {
  BigEndian,
  LittleEndian
}

export class Format {
  // Maps [RecordName].[FieldName] to Field object
  private fieldsMap: Map<string, Field> = new Map<string, Field>();

  public description: string | null = null;
  public specificationUrl: string | null = null;

  constructor(
    public readonly name: string,
    private readonly recordDefinitions: RecordDefinition[],
    private readonly config: { byteOrder: ByteOrder } = {
      byteOrder: ByteOrder.LittleEndian
    }
  ) {}

  private getFieldValueByName(fieldName: string, recordName: string): ArrayBuffer {
    const hasDot = fieldName.includes(".");
    const fullFieldName = hasDot ? `${fieldName}` : `${recordName}.${fieldName}`;
    if (!this.fieldsMap.has(fullFieldName)) {
      throw new Error(`Field with name "${fullFieldName}" does not exist`);
    }

    return this.fieldsMap.get(fullFieldName)!.value;
  }

  private resolveValueToNumber(value: number | string, recordName: string): number {
    if (typeof value === "number") {
      return value;
    } else {
      return ArrayBufferHelper.bufferAsUInt(this.getFieldValueByName(value, recordName), this.config.byteOrder);
    }
  }

  /**
   * Record size is specified as a fixed number or full field name in the form [RecordName].[FieldName]
   */
  private getRecordSize(definition: RecordDefinition): number {
    return this.resolveValueToNumber(definition.size, definition.name);
  }

  /**
   * Record repeat count is specified as a fixed number or full field name in the form [RecordName].[FieldName]
   */
  private getRecordRepeatCount(definition: RepeatedRecordDefinition): number {
    return this.resolveValueToNumber(definition.repeatCount, definition.name);
  }

  /**
   * Field size is specified as:
   * 1. A fixed number
   * 2. Full field name in the form [RecordName].[FieldName] if the field is outside of this record
   * 3. Just the [FieldName] if the field is inside the same record
   */
  private getFieldSize(fieldDefinition: FieldDefinition, recordDefinition: RecordDefinition) {
    return this.resolveValueToNumber(fieldDefinition.size, recordDefinition.name);
  }

  private readFieldUsingDefinition(
    buffer: ArrayBuffer,
    fieldDefinition: FieldDefinition,
    recordDefinition: RecordDefinition
  ): Field | null {
    const size = this.getFieldSize(fieldDefinition, recordDefinition);
    const value = buffer.slice(0, size);

    if (fieldDefinition instanceof OptionalFieldDefinition) {
      // Every condition should be satisfied
      const conditionsMatch = fieldDefinition.conditions.every((condition) => {
        const conditionValue = new Uint8Array(this.getFieldValueByName(condition.fieldName, recordDefinition.name));

        // Only one of the field value should match
        return condition.fieldValue.some((v) => areArrayBuffersEqual(conditionValue, new Uint8Array(v)));
      });

      if (!conditionsMatch) {
        return null;
      }
    }

    return new Field(fieldDefinition, size, value);
  }

  private readRecordUsingDefinition(
    buffer: ArrayBuffer,
    definition: RecordDefinition
  ): { record: Record; readSize: number } {
    let dataIndex = 0;
    const record = new Record(definition);

    // Read fields using all the field definitions in this record
    for (const fieldDefinition of definition.fieldDefinitions) {
      const field = this.readFieldUsingDefinition(buffer.slice(dataIndex), fieldDefinition, definition);

      // This could be an optional field which was skipped
      if (!field) {
        continue;
      }

      record.fields.push(field);
      this.fieldsMap.set(`${record.definition.name}.${field.definition.name}`, field);

      dataIndex += field.size;
    }

    // Check if there is some leftover data at the end of the record for which there are no field definitions
    // This could happen when the record size specified in the record is larger than the sum of sizes of all fields
    // E.g. when the field definition is v1 but the file's record is v3 with more fields
    const recordSize = this.getRecordSize(definition);
    if (recordSize > dataIndex) {
      const remainingSize = recordSize - dataIndex;
      const strayFieldDefinition = new FieldDefinition("__StrayData__", remainingSize);
      const strayField = this.readFieldUsingDefinition(buffer.slice(dataIndex), strayFieldDefinition, definition);

      record.fields.push(strayField!);
      dataIndex += remainingSize;
    }

    return { record, readSize: dataIndex };
  }

  private readRepeatedRecordsUsingDefinition(
    buffer: ArrayBuffer,
    definition: RepeatedRecordDefinition
  ): { records: Record[]; readSize: number } {
    const records: Record[] = [];
    const repeatCount = this.getRecordRepeatCount(definition);

    let dataIndex = 0;
    for (let index = 0; index < repeatCount; index++) {
      const { record, readSize } = this.readRecordUsingDefinition(buffer.slice(dataIndex), definition);

      records.push(record);
      dataIndex += readSize;

      // Used in case of continuous repeat without a repeat count limit
      if (dataIndex >= buffer.byteLength) {
        break;
      }
    }

    return { records, readSize: dataIndex };
  }

  public read(buffer: ArrayBuffer): Record[] {
    let dataIndex = 0;
    const records: Record[] = [];

    for (const definition of this.recordDefinitions) {
      if (definition instanceof RepeatedRecordDefinition) {
        const { records: repeatedRecords, readSize } = this.readRepeatedRecordsUsingDefinition(
          buffer.slice(dataIndex),
          definition
        );
        dataIndex += readSize;
        records.push(...repeatedRecords);
      } else {
        const { record, readSize } = this.readRecordUsingDefinition(buffer.slice(dataIndex), definition);

        records.push(record);
        dataIndex += readSize;
      }
    }

    if (dataIndex < buffer.byteLength) {
      console.log(this.name, "Warning: Unread data size", buffer.byteLength - dataIndex);
    }

    return records;
  }
}

function areArrayBuffersEqual(buf1: ArrayBuffer, buf2: ArrayBuffer): boolean {
  if (buf1.byteLength !== buf2.byteLength) {
    return false;
  }

  const dv1 = new Int8Array(buf1);
  const dv2 = new Int8Array(buf2);
  for (let i = 0; i !== buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) {
      return false;
    }
  }

  return true;
}
