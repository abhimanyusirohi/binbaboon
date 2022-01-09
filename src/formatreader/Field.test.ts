import { Field } from "./Field";
import { FieldDefinition } from "./FieldDefinition";

describe("Field", () => {
  test("must return value description", () => {
    const buffer = new Uint8Array([100]);

    const definition = new FieldDefinition("Test Field", 4);
    definition.setDescriptionForValue(buffer, "Some Description");

    // Use a different buffer for the value to make sure we aren't keeping a ref
    const valueBuffer = new Uint8Array([100]);
    const field = new Field(definition, 4, valueBuffer);
    expect(field.valueDescription).toBe("Some Description");
  });
});
