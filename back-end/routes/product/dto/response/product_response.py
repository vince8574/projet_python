from marshmallow import Schema, fields


class ProductResponse(Schema):
  id = fields.String()
  designation = fields.String()
  numLot = fields.Integer()
  totalLot = fields.Integer()
  dateCreation = fields.String()
  dateFreeze = fields.String()
  dateDefrost = fields.String()
  photos = fields.List(fields.String())
  pdf = fields.String()
  nbFreeze = fields.Integer()
