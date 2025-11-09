import resumeJson from "@/../bharathkumar-resume.json";

type Personal = {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

type ExperienceItem = {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
};

type ProjectItem = {
  name: string;
  desc: string;
  tech: string;
  url?: string;
};

type EducationItem = {
  degree: string;
  school: string;
  dates: string;
  details: string[];
};

export type Resume = {
  personal: Personal;
  profile: string;
  techStack: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  leadership: string[];
  openSource: string[];
  education: EducationItem[];
};

const resumeData = resumeJson as Resume;

export default resumeData;
