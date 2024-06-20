from marshmallow import Schema, fields

class UpdateProduct(Schema):
  id = fields.String()
  designation = fields.String()
  totalLot = fields.Integer()
  dateCreation = fields.String()
  dateFreeze = fields.String()
  dateDefrost = fields.String()
  pdf = fields.String()
  historique = fields.String()
  