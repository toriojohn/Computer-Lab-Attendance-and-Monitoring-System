import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";

interface Event {
  event_id: string;
  title: string;
  start: Date;
  end: Date;
  teacher_name: string;
  subject: string;
  course: string;
  section: string;
  subtitle: string;
}

interface ApiResponse {
  event_id: string;
  title: string;
  start: string;  // The API returns a string date
  end: string;    // The API returns a string date
  teacher_name: string;
  subject: string;
  course: string;
  section: string;
  subtitle: string;
}

interface Teacher {
  id: number;
  text: string;
  value: string;
}

export const TeacherScheduler = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeachers");
      
      const names = response.data.map((teacher: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${teacher.firstname} ${teacher.lastname}`,
        value: `${teacher.firstname} ${teacher.lastname}`,
      }));
      
      setTeacherOptions(names);
      return names; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get<ApiResponse[]>("https://comlab-backend.vercel.app/api/schedule/getSched");

      const parsedEvents: Event[] = response.data.map(event => ({
        event_id: event.event_id,
        title: event.title,
        start: new Date(event.start), // Convert start date string to Date
        end: new Date(event.end),     // Convert end date string to Date
        teacher_name: event.teacher_name,
        subject: event.subject,
        course: event.course,
        section: event.section,
        subtitle: event.subtitle,
      }));

      setEvents(parsedEvents);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchTeachers();
      await fetchSchedules();
      setIsLoading(false);
    };

    initializeData();
  }, []);


  if (isLoading) {
    return <Skeleton className="flex justify-center items-center h-full"></Skeleton>;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full">
        <Scheduler
          height={600} 
          draggable={false}
          events={events}
          deletable={false}
          editable={false}
          week={{
            weekDays: [0, 1, 2, 3, 4, 5], 
            weekStartOn: 6, 
            startHour: 6, 
            endHour: 22,
            step: 60,
          }}
          day={{
            startHour: 6, 
            endHour: 22, 
            step: 60,
          }}
          fields={[
            {
              name: "teacher_name",
              type: "select",
              options: teacherOptions,
              config: { label: "Teacher", required: true, errMsg: "Please select a teacher" },
            },
            {
              name: "subject",
              type: "select",
              options: [
                { id: 1, text: "Math", value: "Math" },
                { id: 2, text: "Science", value: "Science" },
                { id: 3, text: "English", value: "English" },
              ],
              config: { label: "Subject", required: true, errMsg: "Please select a subject" },
            },
            {
              name: "course",
              type: "select",
              options: [
                { id: 8, text: "BSIS", value: "BSIS" },
                { id: 7, text: "BSIT", value: "BSIT" },
                { id: 9, text: "BSOM", value: "BSOM" },
              ],
              config: { label: "Course", required: true, errMsg: "Please select a course" },
            },
            {
              name: "section",
              type: "select",
              options: [
                { id: 10, text: "4A", value: "4A" },
                { id: 12, text: "4B", value: "4B" },
                { id: 13, text: "4C", value: "4C" },
              ],
              config: { label: "Section", required: true, errMsg: "Please select a section" },
            },
          ]}
        />
      </div>
    </div>
  );
};