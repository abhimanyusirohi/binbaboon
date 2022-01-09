//
// FieldDefinition
// Prototype for a field
//

export class FieldDefinition {
  private valueDescriptions = new Map<string, string>();

  public description: string | undefined;
  public displayName: string | undefined;

  /**
   * Get the description associated with a value
   * e.g. In BMP format, the header size value of 40 is associated with 40BITMAPINFOHEADER
   *
   * @param value The value for which description is needed
   * @returns Description string if the value has a description, undefined otherwise
   */
  public getDescriptionForValue(value: ArrayBuffer): string | undefined {
    const stringValue = new Uint8Array(value).join();
    if (!this.valueDescriptions.has(stringValue)) {
      return undefined;
    }

    return this.valueDescriptions.get(stringValue);
  }

  /**
   * Associates a description string with a value
   * Keeps a string representation of the array buffer and not its reference
   *
   * @param value The value for which description needs to be set
   * @param description The description string
   */
  public setDescriptionForValue(value: ArrayBuffer, description: string) {
    this.valueDescriptions.set(new Uint8Array(value).join(), description);
  }

  constructor(public readonly name: string, public readonly size: number | string) {}
}

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
