//
// Field
//

import { FieldDefinition } from "./FieldDefinition";

export class Field {
  /**
   * Constructor
   *
   * @param definition The definition for this field
   * @param size The actual size of this field calculated at runtime
   * @param value The field value calculated at runtime
   */
  constructor(
    public readonly definition: FieldDefinition,
    public readonly size: number,
    public readonly value: ArrayBuffer
  ) {}

  public get valueAsUTF8(): string {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(this.value)));
  }

  /**
   * Get the description associated with the field's current value
   */
  public get valueDescription(): string | undefined {
    return this.definition.getDescriptionForValue(this.value);
  }
}
