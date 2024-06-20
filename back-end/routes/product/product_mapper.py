from .product import Products

from firebase_admin.firestore import DocumentReference, DocumentSnapshot

def to_entity(product_data: dict | DocumentReference | DocumentSnapshot) -> Products:
  p = Products()

  if isinstance(product_data, DocumentReference):
    product_data = product_data.get()
    
  if isinstance(product_data, DocumentSnapshot):
    p.id = product_data.id
    product_data = product_data.to_dict()
  
 

  p.designation = product_data["designation"]
  p.numLot = product_data.get('numLot', -1)
  p.totalLot = product_data["totalLot"]
  p.dateCreation = product_data["dateCreation"]
  p.dateFreeze = product_data["dateFreeze"]
  p.dateDefrost = product_data.get("dateDefrost", '')
  p.photos = product_data.get("photos", '')
  p.pdf = product_data.get("pdf", '')
  p.nbFreeze = product_data["nbFreeze"]
  return p

def toUpdateEntity(product_data: dict) -> Products:
  print(f"UpdateEntity : {product_data}")
  p = Products()
  p.id = product_data["id"]
  p.designation = product_data["designation"]
  p.numLot = product_data.get("numLot", -1)
  p.totalLot = product_data["totalLot"]
  p.dateCreation = product_data.get("dateCreation", "")
  p.dateFreeze = product_data.get("dateFreeze", "")
  p.dateDefrost = product_data.get("dateDefrost", "")
  p.pdf = product_data.get("pdf", "")
  p.historique = product_data.get("historique", "")
  print(f"p est égale à :{p}")
  return p

def to_dict(p: Products) -> dict:
  return {
    "id": p.id,
    "designation": p.designation,
    "numLot": p.numLot,
    "ref": p.ref,
    "totalLot": p.totalLot,
    "dateCreation": p.dateCreation,
    "dateFreeze": p.dateFreeze,
    "dateDefrost": p.dateDefrost,
    "photos": p.photos,
    "pdf": p.pdf,
    "historique": p.historique,
    "nbFreeze": p.nbFreeze
  }