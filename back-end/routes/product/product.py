import datetime
from fpdf import FPDF
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from qr_code.qr_code import QrCode 



class Products:
    def __init__(self, id:str="",designation:str="", numLot:int=None, totalLot:int=None, dateCreation:str="XX-XX-XX", dateFreeze:str="XX-XX-XX", dateDefrost:str="XX-XX-XX", photos:str="", pdf:str="", nbFreeze:int=None):
        self.id = id
        self.designation = designation
        self.numLot = numLot
        self.totalLot = totalLot
        self.dateCreation = dateCreation
        self.dateFreeze = dateFreeze
        self.dateDefrost = dateDefrost 
        self.photos = photos
        self.pdf = pdf
        self.nbFreeze = nbFreeze

    

    def print(self):
        pass

    

    def __repr__(self):
        return f"'{self.id} {self.designation} {self.numLot} {self.totalLot} {self.dateCreation}"