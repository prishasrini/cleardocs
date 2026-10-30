// Shapes of the data the backend sends back. They match the Mongoose models in backend/models.

export type Role = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Service = {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  turnaround: string;
  startingPrice: number;
  requiredDocuments: string[];
};

export type RequestStatus = "submitted" | "in_review" | "processing" | "completed" | "rejected";

export type UploadedFile = {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
};

export type DocRequest = {
  _id: string;
  service: Pick<Service, "_id" | "title" | "slug"> & { turnaround?: string };
  user: string | { _id: string; name: string; email: string };
  notes?: string;
  files: UploadedFile[];
  status: RequestStatus;
  history: { status: RequestStatus; note?: string; at: string }[];
  createdAt: string;
  updatedAt: string;
};
