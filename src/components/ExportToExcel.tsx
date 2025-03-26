import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx';
import { Button } from './ui/button';
import axios from 'axios';

export const ExportToExcel = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://comlab-backend.vercel.app/api/student/getAttendance")
        const result = await response.data;
        setData(result)
        console.log(result)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData();
  }, [])

  const exportToExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert the data to a worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');
    
    // Write the workbook to a binary string and trigger the download
    XLSX.writeFile(wb, 'attendance_data.xlsx');
  };

  return (
    <Button onClick={exportToExcel}>Export To Excel</Button>
  )
}
