import pymongo
from openpyxl import load_workbook
from datetime import datetime, timedelta, timezone

from datetime import timezone

# OBSERVERA att date från MongoDB blir ett python datetime-objekt. grymt!
def utc_to_local(utc_dt):
    return utc_dt.replace(tzinfo=timezone.utc).astimezone(tz=None)

def getWeekday(dayNr):
	if dayNr == 0: return "Måndag"
	elif dayNr == 1: return "Tisdag"
	elif dayNr == 2: return "Onsdag"
	elif dayNr == 3: return "Torsdag"
	elif dayNr == 4: return "Fredag" 
	elif dayNr == 5: return "Lördag"
	elif dayNr == 6: return "Söndag"


wb = load_workbook("./tomtark.xlsx")
wb.template=False
print(wb.sheetnames)

sheet = wb["Blad1"]
print(sheet.title)

print(sheet.cell(1,1).value)

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydb"]
mycol = mydb["Skarpe Nord"]

mydoc = mycol.find().sort("date")

excelRowCount = 1
oldWeek = 0
for x in mydoc:
  newWeek = utc_to_local(x["date"]).isocalendar()[1]
  print(x["date"])
  date = x["date"] + timedelta(hours=1)
  print(date)
  dateString = date.strftime("%a, %d %b, %H:%M")

  if newWeek != oldWeek:
  	sheet.cell(excelRowCount, 1).value = ""
  	excelRowCount = excelRowCount + 1
  	sheet.cell(excelRowCount, 1).value = "Vecka"
  	sheet.cell(excelRowCount, 2).value = newWeek
  	excelRowCount = excelRowCount + 1
  	sheet.cell(excelRowCount, 1).value = dateString
  	#sheet.cell(excelRowCount, 2).value = getWeekday(date.weekday())
  	sheet.cell(excelRowCount, 3).value = x["homeTeamName"]
  	sheet.cell(excelRowCount, 4).value = x["awayTeamName"]
  	sheet.cell(excelRowCount, 5).value = x["series"]
  	excelRowCount = excelRowCount + 1
  else:
  	sheet.cell(excelRowCount, 1).value = dateString
  	#sheet.cell(excelRowCount, 2).value = getWeekday(date.weekday())
  	sheet.cell(excelRowCount, 3).value = x["homeTeamName"]
  	sheet.cell(excelRowCount, 4).value = x["awayTeamName"]
  	sheet.cell(excelRowCount, 5).value = x["series"]
  	excelRowCount = excelRowCount + 1
  oldWeek = newWeek

wb.save("genereratark.xlsx")





