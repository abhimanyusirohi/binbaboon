//
// RecordDefinition
// Prototype for a record i.e. tells how to read a record's data
//

import { FieldDefinition } from "./FieldDefinition";

export class RecordDefinition {
  public description: string | undefined;

  constructor(
    public readonly name: string,
    public readonly size: number | string,
    public readonly fieldDefinitions: FieldDefinition[]
  ) {}
}
