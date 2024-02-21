import qs from "qs";
import { api } from "@/configs/axios.config";
import { IListRes } from "@/models/DataTabel";
import { ICompanyRes } from "@/models/api/company-api";
import ApiRoutes from "./api.routes";

const companyApi = {
    getCompanies: async (body: any) => {
        const response = await api.get<IResponse<IListRes<ICompanyRes>>>(ApiRoutes.getCompanies, {
            params: body,
            paramsSerializer: function (params) {
                return qs.stringify(params, { arrayFormat: "brackets" });
            },
        });
        return response.data;
    },
};
export default companyApi;