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
  comlab: string;
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
  comlab: string;
}

interface Teacher {
  id: number;
  text: string;
  value: string;
}

interface ComLab {
  id: number;
  text: string;
  value: string,
}

interface Courses {
  id: number;
  text: string;
  value: string,
}

interface Subjects {
  id: number;
  text: string;
  value: string,
}

export const SchedulerComponent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<Teacher[]>([]);
  const [comlabOptions, setComlabOptions] = useState<ComLab[]>([]);
  const [coursesOptions, setCoursesOptions] = useState<Courses[]>([]);
  const [subjectsOptions, setSubjectsOptions] = useState<Subjects[]>([]);
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

  const fetchComlabs = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/computer/getList");
      // console.log(response.data.com)
      const comlabs = response.data.com.map((comlab: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${comlab.name}`,
        value: `${comlab.name}`,
      }));
      
      setComlabOptions(comlabs);
      return comlabs; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching comlabs:", error);
      return [];
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getCourses");
      // console.log(response.data.com)
      const courses = response.data.map((course: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${course.course}`,
        value: `${course.course}`,
      }));
      
      setCoursesOptions(courses);
      return courses; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getSubjects");
      // console.log(response.data.com)
      const subjects = response.data.map((subject: any, index: number) => ({
        id: index + 1, // Increment id starting from 1
        text: `${subject.subject}`,
        value: `${subject.subject}`,
      }));
      
      setSubjectsOptions(subjects);
      return subjects; // Return the teacher names for synchronization
    } catch (error) {
      console.error("Error fetching subjects:", error);
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
        comlab: event.comlab,
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
      await fetchComlabs();
      await fetchCourses();
      await fetchSubjects();
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handleConfirm = async (event: Event, action: "create" | "edit") => {
    if (action === "create") {
      const newEvent = {
        event_id: Date.now().toString(), // Generate a unique ID using Date.now()
        title: event.title,
        start: event.start.toISOString(), // Convert to ISO string
        end: event.end.toISOString(),     // Convert to ISO string
        teacher_name: event.teacher_name,  
        subject: event.subject,
        course: event.course,
        section: event.section,
        subtitle: event.subtitle,
        comlab: event.comlab
      };

      try {
        const response = await axios.post("https://comlab-backend.vercel.app/api/schedule/addSchedule", newEvent);
        if (response.data) {
          console.log("Event added successfully:", response.data);
          // Refresh the events after adding
          fetchSchedules();
        }
      } catch (error) {
        console.error("Error adding new event:", error);
      }
    } else if (action === "edit") {
      try {
        const updatedEvent = {
          event_id: event.event_id,
          title: event.title,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          teacher_name: event.teacher_name,
          subject: event.subject,
          course: event.course,
          section: event.section,
          subtitle: event.subtitle,
          comlab: event.comlab,
        };
        
        await axios.put(`https://comlab-backend.vercel.app/api/schedule/updateSched`, updatedEvent);
        
        fetchSchedules();
      } catch (error) {
        console.error("Error updating event:", error);
      }
    }
    return event;
  };

  const handleDelete = async (event_id: string) => {
    try {
      // Send a DELETE request to remove the event
      await axios.delete(`https://comlab-backend.vercel.app/api/schedule/deleteSched/${event_id}`);
      console.log("Deleted event id:", event_id);
      // Refresh the events after deletion
      setEvents(events.filter(event => event.event_id !== event_id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
    return Promise.resolve(event_id);
  };

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
              options: subjectsOptions,
              config: { label: "Subject", required: true, errMsg: "Please select a subject" },
            },
            {
              name: "course",
              type: "select",
              options: coursesOptions,
              config: { label: "Course", required: true, errMsg: "Please select a course" },
            },
            {
              name: "section",
              type: "select",
              options: [
                { id: "1A", text: "1A", value: "1A" },
                { id: "1B", text: "1B", value: "1B" },
                { id: "1C", text: "1C", value: "1C" },
                { id: "1D", text: "1D", value: "1D" },
                { id: "1E", text: "1E", value: "1E" },
                { id: "1F", text: "1F", value: "1F" },
                { id: "1G", text: "1G", value: "1G" },
                { id: "1H", text: "1H", value: "1H" },
                { id: "1I", text: "1I", value: "1I" },
                { id: "1J", text: "1J", value: "1J" },
                { id: "2A", text: "2A", value: "2A" },
                { id: "2B", text: "2B", value: "2B" },
                { id: "2C", text: "2C", value: "2C" },
                { id: "2D", text: "2D", value: "2D" },
                { id: "2E", text: "2E", value: "2E" },
                { id: "2F", text: "2F", value: "2F" },
                { id: "2G", text: "2G", value: "2G" },
                { id: "2H", text: "2H", value: "2H" },
                { id: "2I", text: "2I", value: "2I" },
                { id: "2J", text: "2J", value: "2J" },
                { id: "3A", text: "3A", value: "3A" },
                { id: "3B", text: "3B", value: "3B" },
                { id: "3C", text: "3C", value: "3C" },
                { id: "3D", text: "3D", value: "3D" },
                { id: "3E", text: "3E", value: "3E" },
                { id: "3F", text: "3F", value: "3F" },
                { id: "3G", text: "3G", value: "3G" },
                { id: "3H", text: "3H", value: "3H" },
                { id: "3I", text: "3I", value: "3I" },
                { id: "3J", text: "3J", value: "3J" },
                { id: "4A", text: "4A", value: "4A" },
                { id: "4B", text: "4B", value: "4B" },
                { id: "4C", text: "4C", value: "4C" },
                { id: "4D", text: "4D", value: "4D" },
                { id: "4E", text: "4E", value: "4E" },
                { id: "4F", text: "4F", value: "4F" },
                { id: "4G", text: "4G", value: "4G" },
                { id: "4H", text: "4H", value: "4H" },
                { id: "4I", text: "4I", value: "4I" },
                { id: "4J", text: "4J", value: "4J" },
              ],
              config: { label: "Section", required: true, errMsg: "Please select a section" },
            },
            {
              name: "comlab",
              type: "select",
              options: comlabOptions,
              config: { label: "Com Lab", required: true, errMsg: "Please select a comlab" },
            },
          ]}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};