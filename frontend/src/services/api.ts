import { getToken } from "./auth";

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

export const API_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:8000/api`
    : "http://localhost:8000/api";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type Contractor = {
  id: number;
  contractor_code: string;
  company_name: string;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  status: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ContractorInput = {
  contractor_code: string;
  company_name: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  status: "active" | "inactive" | "suspended";
  description?: string;
};

export type Contract = {
  id: number;
  contractor_id: number;
  contract_value: number;
  start_date: string;
  end_date: string;
  performance: number;
  status: "active" | "completed" | "expired" | "suspended";
};

export type ContractInput = {
  contractor_id: number;
  contract_value: number;
  start_date: string;
  end_date: string;
  performance: number;
  status: "active" | "completed" | "expired" | "suspended";
};

/*
|--------------------------------------------------------------------------
| AUTHENTICATED HEADERS
|--------------------------------------------------------------------------
*/

async function getHeaders(
  includeJson: boolean = false
): Promise<Record<string, string>> {

  const token = await getToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/*
|--------------------------------------------------------------------------
| RESPONSE HANDLER
|--------------------------------------------------------------------------
*/

async function handleResponse(
  response: Response
) {

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {

    if (response.status === 401) {
      throw new Error(
        "Unauthenticated. Please login again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        data?.message ||
          "You are not authorized to perform this action."
      );
    }

    throw new Error(
      data?.message ||
        data?.error ||
        `HTTP error: ${response.status}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| EMPLOYEES
|--------------------------------------------------------------------------
*/

export async function getEmployees() {

  const response = await fetch(
    `${API_URL}/employees`,
    {
      method: "GET",
      headers: await getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function createEmployee(data: {
  name: string;
  email: string;
  password: string;
}) {

  const response = await fetch(
    `${API_URL}/employees`,
    {
      method: "POST",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function updateEmployee(
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
  }
) {

  const response = await fetch(
    `${API_URL}/employees/${id}`,
    {
      method: "PUT",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function deleteEmployee(
  id: number
) {

  const response = await fetch(
    `${API_URL}/employees/${id}`,
    {
      method: "DELETE",
      headers: await getHeaders(),
    }
  );

  return handleResponse(response);
}

/*
|--------------------------------------------------------------------------
| CONTRACTORS
|--------------------------------------------------------------------------
*/

export async function getContractors(): Promise<
  Contractor[]
> {

  const response = await fetch(
    `${API_URL}/contractors`,
    {
      method: "GET",
      headers: await getHeaders(),
    }
  );

  const result =
    await handleResponse(response);

  if (Array.isArray(result)) {
    return result as Contractor[];
  }

  if (Array.isArray(result?.data)) {
    return result.data as Contractor[];
  }

  if (Array.isArray(result?.contractors)) {
    return result.contractors as Contractor[];
  }

  return [];
}

export async function createContractor(
  data: ContractorInput
): Promise<Contractor> {

  const response = await fetch(
    `${API_URL}/contractors`,
    {
      method: "POST",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  const result =
    await handleResponse(response);

  return (
    result?.contractor ||
    result?.data ||
    result
  ) as Contractor;
}

export async function updateContractor(
  id: number,
  data: Partial<ContractorInput>
): Promise<Contractor> {

  const response = await fetch(
    `${API_URL}/contractors/${id}`,
    {
      method: "PUT",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  const result =
    await handleResponse(response);

  return (
    result?.contractor ||
    result?.data ||
    result
  ) as Contractor;
}

export async function deleteContractor(
  id: number
) {

  const response = await fetch(
    `${API_URL}/contractors/${id}`,
    {
      method: "DELETE",
      headers: await getHeaders(),
    }
  );

  return handleResponse(response);
}

/*
|--------------------------------------------------------------------------
| CONTRACTS
|--------------------------------------------------------------------------
*/

export async function getContracts(): Promise<
  Contract[]
> {

  const response = await fetch(
    `${API_URL}/contracts`,
    {
      method: "GET",
      headers: await getHeaders(),
    }
  );

  const result =
    await handleResponse(response);

  if (Array.isArray(result)) {
    return result as Contract[];
  }

  if (Array.isArray(result?.data)) {
    return result.data as Contract[];
  }

  if (Array.isArray(result?.contracts)) {
    return result.contracts as Contract[];
  }

  return [];
}

export async function createContract(
  data: ContractInput
): Promise<Contract> {

  const response = await fetch(
    `${API_URL}/contracts`,
    {
      method: "POST",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  const result =
    await handleResponse(response);

  return (
    result?.contract ||
    result?.data ||
    result
  ) as Contract;
}

export async function updateContract(
  id: number,
  data: Partial<ContractInput>
): Promise<Contract> {

  const response = await fetch(
    `${API_URL}/contracts/${id}`,
    {
      method: "PUT",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  const result =
    await handleResponse(response);

  return (
    result?.contract ||
    result?.data ||
    result
  ) as Contract;
}

export async function deleteContract(
  id: number
) {

  const response = await fetch(
    `${API_URL}/contracts/${id}`,
    {
      method: "DELETE",
      headers: await getHeaders(),
    }
  );

  return handleResponse(response);
}

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

export async function getMe() {

  const response = await fetch(
    `${API_URL}/me`,
    {
      method: "GET",
      headers: await getHeaders(),
    }
  );

  return handleResponse(response);
}

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
*/

export async function updateProfile(
  data: {
    name: string;
    email: string;
  }
) {

  const response = await fetch(
    `${API_URL}/profile`,
    {
      method: "PUT",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
*/

export async function changePassword(
  data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }
) {

  const response = await fetch(
    `${API_URL}/change-password`,
    {
      method: "PUT",
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}