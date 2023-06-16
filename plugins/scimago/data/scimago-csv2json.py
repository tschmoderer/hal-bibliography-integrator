import csv
import sys
import json

if __name__ == "__main__":
    csv_filename = sys.argv[1]
    json_filename = csv_filename.split(".")[0] + ".json"
    print(json_filename)
    data = {}
    with open(csv_filename,  encoding = 'utf-8') as csv_file_handler:
        csv_reader = csv.DictReader(csv_file_handler,delimiter=';')
        for rows in csv_reader:
            # filter only journals
            if rows["Type"] == "journal":
                key = rows['Rank']
                data[key] = rows
    
    # Clean data
    # define the keys to remove
    keys = [
        'Country', 
        'Region', 
        'Coverage', 
        'Issn', 
        'Total Docs. (2022)', 
        'Total Docs. (3years)',
        'Total Refs.',
        'Total Cites (3years)',
        'Citable Docs. (3years)',
        'Cites / Doc. (2years)',
        'Ref. / Doc.',
        'Publisher',
        'Areas', 
        "Type",
    ]
    for d in data: 
        for key in keys:
            data[d].pop(key, None)
        
        # process categories 
        tmp = data[d]["Categories"]
        data[d]["Categories"] = []
        tmpsp = tmp.split(";")
        for s in tmpsp: 
            s = s.strip()
            new_s = s.rsplit(' ', 1)
            cat = new_s[0]
            if len(new_s) == 1: 
                qua = ""
            else:
                qua = new_s[1].replace('(','').replace(')','')
            data[d]["Categories"].append([cat, qua])

        
    with open(json_filename, 'w', encoding = 'utf-8') as json_file_handler:
        json_file_handler.write(json.dumps(data, indent = 4))