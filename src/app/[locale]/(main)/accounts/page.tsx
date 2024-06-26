"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import { useSorting } from "@/hooks/use-sorting";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./components/cell-action";
import { AccountColumn } from "./components/column";
import FooterContainer from "@/components/layout/footer-container";
import Breadcrumbs from "@/components/ui/breadcrumb";
import { AccountModal } from "./components/account-modal";
import { useFetchDataTable } from "@/data/fetch-data-table";
import ApiRoutes from "@/services/api.routes";
import { useAppSelector } from "@/redux/root/hooks";
import { selectUser } from "@/redux/user/slice";
import { isActionsPermissions } from "@/helpers/funcs";
import { ActionPermissions } from "@/constants/routes";
import { format } from "date-fns";
import { DateTimeFormat, emailRegExp } from "@/constants/variables";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toastError } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchDataRole } from "@/data/fetch-data-role";

interface RoleFilter {
    label: string;
    value: number;
}

export default function AccountsPage() {
    // ** I18n
    const translation = useTranslations("");

    // ** useRef
    const InputEmailSearchRef = useRef<HTMLInputElement>(null);

    // ** User Selector
    const { userPermissions } = useAppSelector(selectUser);
    // Use Row Selection
    const { rowSelection, onRowSelection } = useRowSelection();
    // Use Pagination
    const { limit, onPaginationChange, skip, pagination, page } = usePagination();
    // Use Sorting
    const { sorting, onSortingChange, field, order } = useSorting();

    // ** State
    const [roles, setRoles] = useState<RoleFilter[]>([{ label: "All", value: 0 }]);
    const [openModal, setOpenModal] = useState(false);
    const [rowSelected, setRowSelected] = useState<AccountColumn | null>(null);
    const [paramsSearch, setParamsSearch] = useState({
        search: {},
        filters: {},
    });
    const [paramsDataTable, setParamsDataTable] = useState({
        search: {},
        filters: {},
    });

    // Use fetch data
    const { data, loading, pageCount, refresh, setRefresh } = useFetchDataTable<AccountColumn>({
        url: ApiRoutes.getAccounts,
        paramsDataTable: {
            ...paramsDataTable,
            pagination: {
                page: page ?? 1,
                pageSize: limit ?? 1,
            },
        },
    });

    // Func
    const handleReFreshDataTable = () => {
        setRefresh(!refresh);
    };

    const handleEditRole = (data: AccountColumn) => {
        setRowSelected({
            ...data,
            name: data.name ?? "",
            email: data.email ?? "",
            password: "",
            company_id: data?.company?.id ?? -1,
            company_name: data?.company?.name ?? "",
            role_id: data?.role?.id ?? -1,
            role_name: data?.role?.name ?? "",
        });
        setOpenModal(true);
    };

    const handleCreateRole = () => {
        setRowSelected(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setRowSelected(null);
        setOpenModal(false);
    };

    const handleSearchEmail = (event: any) => {
        setParamsSearch({ ...paramsSearch, search: { ...paramsSearch.search, email: event.target.value } });
    };

    const handleSearchRole = (roleSelected: number) => {
        console.log(roleSelected);
        setParamsSearch(
            roleSelected == 0
                ? {
                      ...paramsSearch,
                      filters: { ...paramsSearch.filters, role_id: "" },
                  }
                : {
                      ...paramsSearch,
                      filters: { ...paramsSearch.filters, role_id: roleSelected },
                  },
        );
    };

    const handleClickSearch = () => {
        let email = InputEmailSearchRef.current?.value.trim() ?? "";
        if (!emailRegExp.test(email) && email.length > 0) {
            toastError(translation("error.invalidEmail"));
            return false;
        }
        setParamsDataTable({ ...paramsDataTable, search: paramsSearch.search, filters: paramsSearch.filters });
    };

    const canCreateAccount = isActionsPermissions(userPermissions, ActionPermissions.CREATE_ACCOUNT);
    const canUpdateAccount = isActionsPermissions(userPermissions, ActionPermissions.UPDATE_ACCOUNT);

    const columns: ColumnDef<AccountColumn>[] = [
        {
            accessorKey: "name",
            header: () => <div className="text-black font-bold">{translation("accountPage.table.name")}</div>,
        },
        {
            accessorKey: "email",
            header: () => <div className="text-black font-bold">{translation("accountPage.table.email")}</div>,
        },
        {
            accessorKey: "company.name",
            header: () => <div className="text-black font-bold">{translation("eventPage.table.companyName")}</div>,
        },
        {
            accessorKey: "role_id",
            header: () => <div className="text-black font-bold">{translation("accountPage.table.role")}</div>,
            cell: ({ row }) => row.original.role?.name,
        },
        {
            accessorKey: "created_at",
            header: () => <div className="text-black font-bold">{translation("accountPage.table.createdAt")}</div>,
            cell: ({ row }) => format(row.original.created_at, DateTimeFormat),
        },
        {
            accessorKey: "status",
            header: () => <div className="text-black font-bold">{translation("accountPage.table.status")}</div>,
            cell: ({ row }) => (
                <BadgeStatus status={row.original.status}>{translation(`status.${row.original.status}`)}</BadgeStatus>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-black font-bold">{translation("datatable.action")}</div>,
            cell: ({ row }) =>
                canUpdateAccount && (
                    <CellAction
                        onRowSelected={() => handleEditRole(row.original)}
                        onRefetch={handleReFreshDataTable}
                        data={row.original}
                    />
                ),
        },
    ];

    // Use fetch data
    const { data: dataRole } = useFetchDataRole({ pagination: { pageSize: 50 } });

    useEffect(() => {
        const rolesFormatted = dataRole.map((role) => ({
            label: role.name,
            value: role.id,
        }));
        setRoles((prev) => [...prev, ...rolesFormatted]);
    }, [dataRole]);

    return (
        <>
            <div className="w-full space-y-4">
                <Breadcrumbs />
                <div className="flex flex-wrap items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{translation("accountPage.title")}</h2>
                    <div className="flex justify-end flex-wrap items-center gap-2 !mt-0">
                        <AccountModal
                            // className="sm:max-w-[460px] overflow-y-auto"
                            dataRoles={roles.filter((role) => role.value != 0)}
                            className="sm:max-w-[976px] overflow-y-auto max-h-svh md:max-h-[550px] 2xl:max-h-[780px]"
                            isOpen={openModal}
                            onClose={handleCloseModal}
                            defaultData={rowSelected}
                            onConfirm={handleReFreshDataTable}
                        />
                        {canCreateAccount && (
                            <Button
                                variant={"secondary"}
                                onClick={handleCreateRole}
                            >
                                <PlusCircle className="w-5 h-5 md:mr-2" />
                                <p className="hidden md:block">{translation("action.create")}</p>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-start items-end w-full md:w-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label
                            className="text-base"
                            htmlFor="email"
                        >
                            {translation("label.email")}
                        </Label>
                        <Input
                            ref={InputEmailSearchRef}
                            disabled={Boolean(loading)}
                            id="email"
                            type="text"
                            className="h-10 text"
                            onChange={handleSearchEmail}
                        />
                    </div>
                    <div className="grid w-full sm:max-w-xl items-center gap-1.5">
                        <Label className="text-base">{translation("label.role")}</Label>
                        <Select
                            disabled={Boolean(loading)}
                            onValueChange={(value) => handleSearchRole(+value)}
                            defaultValue={"0"}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder={translation("placeholder.status")} />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.value}
                                        value={role.value.toString()}
                                    >
                                        {role.label[0].toUpperCase() + role.label.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    disabled={Boolean(loading)}
                    onClick={handleClickSearch}
                >
                    {translation("action.search")}
                </Button>
            </div>

            <DataTable
                loading={loading}
                columns={columns}
                data={data}
                // Pagination
                onPaginationChange={onPaginationChange}
                pageCount={Number(pageCount)}
                pagination={pagination}
                // Row selected
                onRowSelectionChange={onRowSelection}
                rowSelection={rowSelection}
                // Sorting
                onSortingChange={onSortingChange}
                sorting={sorting}
            />
            <FooterContainer />
        </>
    );
}
