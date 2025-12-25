import pandas as pd
import os

# Define the path to your project directory
project_dir = 'D:/V_Project/LMS-New/backend'

# Read the CSV file, skipping the first 7 rows and setting the 8th row as the header
csv_file_path = os.path.join(project_dir, 'app/management/attendance/AIDS.csv')
df = pd.read_csv(csv_file_path, skiprows=7)

# Save as an Excel file
excel_file_path = os.path.join(project_dir, 'app/management/attendance/AIDS.xlsx')
df.to_excel(excel_file_path, index=False, sheet_name='AIDS')

print("CSV file has been successfully converted to Excel format.")
