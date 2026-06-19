import { JobApplication } from "@/types/jobApplication";

export const exportToCSV = (applications: JobApplication[], filename = "applications.csv") => {
  // Define CSV headers
  const headers = [
    "Application ID",
    "Full Name",
    "Email",
    "Phone",
    "Job Title",
    "Years Experience",
    "Status",
    "Applied Date",
    "Updated Date",
  ];

  // Create CSV rows
  const rows = applications.map((app) => [
    app.id,
    app.fullName,
    app.email,
    app.phone,
    app.jobTitle,
    app.answers.yearsExperience,
    app.status,
    new Date(app.appliedAt).toLocaleDateString(),
    app.notes ? new Date(app.appliedAt).toLocaleDateString() : "",
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (applications: JobApplication[], filename = "applications.json") => {
  const jsonContent = JSON.stringify(applications, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
