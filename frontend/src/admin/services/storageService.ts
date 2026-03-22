import apiClient from './apiClient'

export const getPresignedUrl = async (fileName: string, contentType: string, folder: string = 'uploads') => {
    const response = await apiClient.post('/storage/upload-url', {
        fileName,
        contentType,
        folder
    })
    return response.data // returns { url, key, fileName }
}

export const uploadFileToS3 = async (url: string, file: File) => {
    const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to upload file to storage: ${response.statusText}`)
    }

    return true
}
