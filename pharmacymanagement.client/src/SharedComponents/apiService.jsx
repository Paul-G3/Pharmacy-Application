// src/services/apiService.js
const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';

async function handleResponse(response) {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
    }
    return response.json();
}
export async function getData(path, queryObject = null) {
    let url = `${basePath}${path}`;
    const token = localStorage.getItem("jwtToken");
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (queryObject) {
        url += "?" + new URLSearchParams(queryObject).toString();
    }

    try {
        const response = await fetch(url, { headers });
        return await handleResponse(response);
    } catch (err) {
        console.error(`Error fetching data from ${path}:`, err);
        throw err;
    }
}


export async function postData(path, data) {
    const token = localStorage.getItem("jwtToken");
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`${basePath}${path}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error posting data to ${path}:`, error);
        throw error;
    }
}

export async function uploadFile(path, formData) {
    const token = localStorage.getItem("jwtToken");
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Do NOT set Content-Type; browser will set it for FormData

    try {
        const response = await fetch(`${basePath}${path}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error uploading file to ${path}:`, error);
        throw error;
    }
}