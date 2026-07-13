/**
 * Team member data and information
 */

export interface TeamMember {
  name: string;
  role: string;
  department: string;
  image: string;
  bio?: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Rene",
    role: "Sales Development Representative",
    department: "Sales",
    image: "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1782918562/Untitled_design_cuxaeq.png",
    bio: "Driven SDR focused on qualifying and nurturing high-value leads for our enterprise clients.",
  },
  {
    name: "Bruno",
    role: "Sales Development Representative",
    department: "Sales",
    image: "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1782918531/bruno-santos.png",
    bio: "Strategic SDR with a track record of building strong customer relationships and closing deals.",
  },
  {
    name: "Amanda",
    role: "Sales Development Representative",
    department: "Sales",
    image: "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1783964459/7124AA62-35CE-47EF-9EAB-16D50BFA785A_xciubo.png",
    bio: "Customer-focused SDR dedicated to understanding client needs and providing tailored solutions.",
  },
  {
    name: "Mike",
    role: "Accounting",
    department: "Finance",
    image: "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1783964459/83A3A7A4-5E13-41DF-9360-FD01A4B57D18_tld7df.png",
    bio: "Financial expert ensuring accurate accounting and supporting business growth initiatives.",
  },
];
