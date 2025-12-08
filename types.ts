
export interface StudentSkill {
  [key: string]: string | number;
  姓名: string;
  備註: string;
}

export interface ProjectDirector {
  name: string;
  projectName: string;
}

export interface RoleQuota {
  [role: string]: number;
}

export interface FinalAssignment {
  projectName: string;
  director: string;
  crew: {
    role: string;
    student: string;
  }[];
}
