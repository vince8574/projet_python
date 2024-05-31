from .product import Products

from firebase_admin.firestore import DocumentReference, DocumentSnapshot

def to_entity(product_data: dict | DocumentReference | DocumentSnapshot) -> Products:
  p = Products()

  if isinstance(product_data, DocumentReference):
    product_data = product_data.get()
    
  if isinstance(product_data, DocumentSnapshot):
    p.id = product_data.id    
    product_data = product_data.to_dict()
  
  print(product_data)

  p.designation = product_data["designation"]
  p.numLot = product_data["numLot"]
  p.totalLot = product_data["totalLot"]
  p.dateCreation = product_data["dateCreation"]
  p.dateFreeze = product_data["dateFreeze"]
  p.dateDefrost = product_data["dateDefrost"]
  p.picture = product_data["picture"]
  p.pdf = product_data["pdf"]
  p.nbFreeze = product_data["nbFreeze"]
  return p

def toUpdateEntity(product_data: dict) -> Products:
  p = Products
  p.id = product_data.get("id", "")
  p.designation = product_data["designation", ""]
  p.numLot = product_data["numLot", ""]
  p.totalLot = product_data["totalLot", ""]
  p.dateCreation = product_data["dateCreation", ""]
  p.dateFreeze = product_data["dateFreeze", ""]
  p.dateDefrost = product_data["dateDefrost", ""]
  p.picture = product_data["picture", ""]
  p.pdf = product_data["pdf", ""]
  p.nbFreeze = product_data["nbFreeze", ""]
  return p

def to_dict(p: Products) -> dict:
  return {
    "id": p.id,
    "designation": p.designation,
    "numLot": p.numLot,
    "totalLot": p.totalLot,
    "dateCreation": p.dateCreation,
    "dateFreeze": p.dateFreeze,
    "dateDefrost": p.dateDefrost,
    "picture": p.picture,
    "pdf": p.pdf,
    "nbFreeze": p.nbFreeze
  }