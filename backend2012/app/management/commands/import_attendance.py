import pandas as pd
from django.core.management.base import BaseCommand
from app.models import StudentAttendance
import re

class Command(BaseCommand):
    help = 'Import attendance data from Excel file'

    def handle(self, *args, **kwargs):
        file_path = 'app/management/attendance/AIDS.xlsx'
        df = pd.read_excel(file_path, sheet_name='AIDS', skiprows=7)
        
        # Print the columns to debug
        print(df.columns)
        
        # Convert string columns to a consistent case
        df.columns = [col.strip().lower() if isinstance(col, str) else col for col in df.columns]
        
        # Update these lines with the actual column names from your DataFrame
        department_col = 'ai & ds'  # Actual column name
        register_number_col = 'dsug20243002'  # Actual column name
        student_name_col = 'aishwarya n'  # Actual column name
        total_present_col = 'a'  # Replace with actual column name for total present
        total_absent_col = 'p'    # Replace with actual column name for total absent
        percentage_of_attendance_col = '72.86%'  # Replace with actual column name for percentage of attendance
        
        for index, row in df.iterrows():
            # Extract data from the current row
            department = row[department_col]
            register_number = row[register_number_col]
            student_name = row[student_name_col]
            total_present = row[total_present_col]
            total_absent = row[total_absent_col]
            percentage_of_attendance = row[percentage_of_attendance_col]
            
            # Iterate over the attendance columns
            for col in df.columns[4:-3]:  # Adjust this range based on your DataFrame structure
                if isinstance(col, str) and '(' in col:
                    date_str, session = col.split('(')
                    date_str = date_str.strip()
                    session = session.strip(')')
                    try:
                        date = pd.to_datetime(date_str)
                    except ValueError:
                        self.stdout.write(f'Error parsing date: {date_str}')
                        continue

                    status = row[col]
                    
                    # Create and save the StudentAttendance record
                    StudentAttendance.objects.create(
                        department=department,
                        register_number=register_number,
                        student_name=student_name,
                        date=date,
                        session=session,
                        status=status,
                        total_present=total_present,
                        total_absent=total_absent,
                        percentage_of_attendance=percentage_of_attendance
                    )
                else:
                    self.stdout.write(f'Skipping column {col} as it does not match expected format')

        self.stdout.write(self.style.SUCCESS('Successfully imported attendance data'))
