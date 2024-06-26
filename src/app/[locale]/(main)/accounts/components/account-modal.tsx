"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IModal } from "@/models/Modal";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import SpanRequired from "@/components/ui/span-required";
import { APIStatus, EStatus, MessageCode } from "@/constants/enum";
import { toastError, toastSuccess } from "@/utils/toast";
import { IAccountRes } from "@/models/api/account-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCOUNT_STATUS } from "@/constants/variables";
import { IOption } from "@/models/Select";
import { IRoleRes } from "@/models/api/role-api";
import ApiRoutes from "@/services/api.routes";
import { useFetchDataTable } from "@/data/fetch-data-table";
import { ComboboxSearchCompany } from "./combobox-search-company";
import accountApi from "@/services/account-api";
import DataTableConfig from "@/configs/DataTableConfig";
import { PasswordInput } from "@/components/ui/password-input";
import { useAppSelector } from "@/redux/root/hooks";
import { selectUser } from "@/redux/user/slice";

interface CompanyModalProps extends IModal {
    className?: string;
    defaultData: IAccountRes | null;
    onConfirm: () => void;
    dataRoles: IOption[] | [];
}

export const AccountModal: React.FC<CompanyModalProps> = ({
    isOpen,
    onClose,
    defaultData,
    className,
    onConfirm,
    dataRoles,
}) => {
    // ** I18n
    const translation = useTranslations("");

    // ** use selector
    const { userProfile } = useAppSelector(selectUser);

    // ** Use State
    const [roles, setRoles] = useState<IOption[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = defaultData ? translation("accountPage.edit.title") : translation("accountPage.create.title");
    const messageSuccess = defaultData
        ? translation("successApi.UPDATE_ACCOUNT_SUCCESS")
        : translation("successApi.CREATE_ACCOUNT_SUCCESS");
    const messageError = defaultData
        ? translation("errorApi.UPDATE_ACCOUNT_FAILED")
        : translation("errorApi.CREATE_ACCOUNT_FAILED");
    const action = defaultData ? translation("action.save") : translation("action.create");

    // useForm
    const formSchema = z.object({
        id: z.number().optional(),
        name: z.string().min(1, { message: translation("error.requiredName") }),
        email: z
            .string()
            .min(1, { message: translation("error.requiredEmail") })
            .email({ message: translation("error.invalidEmail") }),
        password: z
            .string()
            .min(8, { message: translation("error.invalidPassword") })
            .optional()
            .or(z.literal("")),
        status: z.string(),
        role_id: z.number().min(1, { message: translation("error.requiredRole") }),
        company_id: z.number().min(1, { message: translation("error.requiredCompany") }),
    });
    type AccountFormValues = z.infer<typeof formSchema>;
    const resetDataForm: AccountFormValues = {
        name: "",
        email: "",
        status: EStatus.ACTIVE,
        role_id: -1,
        company_id: userProfile?.is_admin ? -1 : userProfile?.company_id ?? -1,
    };
    const form = useForm<AccountFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultData || resetDataForm,
    });

    const onSubmit = async (data: AccountFormValues) => {
        try {
            setLoading(true);
            const response = await accountApi.storeAccount(data);

            if (response.data.status == APIStatus.SUCCESS) {
                toastSuccess(messageSuccess);
                onConfirm();
                handleCloseModal();
            }
        } catch (error: any) {
            const data = error?.response?.data;
            if (data?.data && data?.message_code == MessageCode.VALIDATION_ERROR) {
                const [value] = Object.values(data.data);
                const message = Array(value).toString() ?? messageError;
                toastError(message);
            } else if (data?.message_code != MessageCode.VALIDATION_ERROR) {
                toastError(translation(`errorApi.${data?.message_code}`));
            } else {
                toastError(messageError);
            }
            console.log("error: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        form.reset();
        onClose();
    };

    useEffect(() => {
        if (defaultData != undefined) {
            form.reset(defaultData);
        } else {
            form.reset({
                ...resetDataForm,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultData]);

    useEffect(() => {
        setRoles(dataRoles);
    }, [dataRoles]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Modal
            className={className}
            title={title}
            description=""
            isOpen={isOpen}
            onClose={handleCloseModal}
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full"
                >
                    {/* <div className="grid grid-cols-1 gap-2 md:gap-4 py-1 md:py-4"> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 py-1 md:py-4">
                        {userProfile?.is_admin && (
                            <FormField
                                control={form.control}
                                name="company_id"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-base">{translation("label.company")}</FormLabel>
                                        <ComboboxSearchCompany
                                            disabled={loading}
                                            onSelectCompany={field.onChange}
                                            defaultName={defaultData?.company?.name || ""}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        {translation("label.name")}
                                        <SpanRequired />
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-10"
                                            disabled={loading}
                                            placeholder={translation("placeholder.name")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {defaultData && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">{translation("label.password")}</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                className="h-10"
                                                disabled={loading}
                                                placeholder={translation("placeholder.password")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-base">
                                        {translation("label.email")}
                                        <SpanRequired />
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-10"
                                            disabled={loading || defaultData != null}
                                            placeholder={translation("placeholder.email")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">{translation("label.role")}</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={(event) => {
                                            field.onChange(Number(event));
                                        }}
                                        defaultValue={field.value == -1 ? "" : field.value.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder={translation("placeholder.role")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map((status) => (
                                                <SelectItem
                                                    key={status.value.toString()}
                                                    value={status.value.toString()}
                                                >
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">{translation("label.status")}</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-10">
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder={translation("placeholder.status")}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ACCOUNT_STATUS.map((status) => (
                                                <SelectItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-x-2 flex items-center justify-end w-full mt-2 sm:mt-0">
                        <Button
                            disabled={loading}
                            variant="default"
                            type="submit"
                        >
                            {action}
                        </Button>
                        <Button
                            type="button"
                            disabled={loading}
                            variant="outline"
                            onClick={handleCloseModal}
                        >
                            {translation("action.cancel")}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
};
