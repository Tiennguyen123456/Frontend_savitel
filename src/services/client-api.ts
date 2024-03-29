import qs from "qs";
import { api } from "@/configs/axios.config";
import ApiRoutes from "./api.routes";

const clientApi = {
    importExcelClient: async (eventId: number, formData: any) => {
        const url = ApiRoutes.importExcelClient + `/${eventId}/client/import`;
        return await api.post<IResponse<null>>(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    storeClient: async (eventId: number, body: any) => {
        const url = ApiRoutes.storeClient + `/${eventId}/client/store`;
        return await api.post<IResponse<null>>(url, body);
    },
    deleteClient: async (eventId: number, clientId: number) => {
        const url = ApiRoutes.deleteClient + `/${eventId}/client/${clientId}`;
        return await api.delete<IResponse<null>>(url);
    },
    checkInClient: async (eventId: number, clientId: any) => {
        const url = ApiRoutes.checkInClient + `/${eventId}/client/${clientId}/checkin`;
        return await api.post<IResponse<null>>(url);
    },
    downloadSampleExcel: async () => {
        const url = ApiRoutes.downloadSampleExcel;
        return await api.get<IResponse<Blob>>(url, {
            responseType: "blob",
        });
    },
    generateQrCode: async (body: any) => {
        const url = ApiRoutes.generateQrCode;
        const response = await api.get<IResponse<string>>(url, {
            params: body,
            paramsSerializer: function (params) {
                return qs.stringify(params, { arrayFormat: "brackets" });
            },
        });
        return response.data;
    },
};
export default clientApi;
