//
// FieldDefinition
//

import { FieldDefinition } from "./FieldDefinition";

export class OptionalFieldDefinition extends FieldDefinition {
  constructor(
    public readonly name: string,
    public readonly size: number | string,
    public readonly conditions: {
      fieldName: string;
      fieldValue: ArrayBuffer[];
    }[]
  ) {
    super(name, size);
  }
}
