from marshmallow import Schema, fields

class CreateProduct(Schema):
  id = fields.String()
  designation = fields.String()
  numLot = fields.Integer()
  totalLot = fields.Integer()
  dateCreation = fields.String()
  dateFreeze = fields.String()
  dateDefrost = fields.String()
  picture = fields.List(fields.String())
  pdf = fields.String()
  nbFreeze = fields.Integer()