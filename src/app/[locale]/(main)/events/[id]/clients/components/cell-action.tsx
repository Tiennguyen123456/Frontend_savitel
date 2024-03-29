"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, ScanBarcode, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientColumn } from "./column";
import { useTranslations } from "next-intl";
import { AlertModal } from "@/components/modals/alert-modal";
import { toastError, toastSuccess } from "@/utils/toast";
import { APIStatus, MessageCode } from "@/constants/enum";
import clientApi from "@/services/client-api";

interface CellActionProps {
    data: ClientColumn;
    onRefetch: () => void;
    onRowSelected: () => void;
    eventId: number;
    isUpdate?: boolean;
    isDelete?: boolean;
    isCheckIn?: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({
    data,
    onRefetch,
    onRowSelected,
    eventId,
    isUpdate = false,
    isDelete = false,
    isCheckIn = false,
}) => {
    // ** I18n
    const translation = useTranslations("");

    // ** State
    const [openModalCheckIn, setOpenModalCheckIn] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [loading, setLoading] = useState(false);

    // ** Func
    const onConfirmDelete = async () => {
        try {
            setLoading(true);

            const response = await clientApi.deleteClient(eventId, data.id);

            if (response.data.status == APIStatus.SUCCESS) {
                toastSuccess(translation("successApi.DELETE_CLIENT_SUCCESS"));
            }
            onRefetch();
        } catch (error: any) {
            const data = error?.response?.data;
            const messageError = translation("errorApi.DELETE_CLIENT_FAILED");
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
            setOpenModalDelete(false);
            setLoading(false);
        }
    };

    const onConfirmCheckIn = async () => {
        try {
            setLoading(true);

            const response = await clientApi.checkInClient(eventId, data.id);

            if (response.data.status == APIStatus.SUCCESS) {
                toastSuccess(translation("successApi.CHECKIN_CLIENT_SUCCESS"));
            }
            onRefetch();
        } catch (error: any) {
            const data = error?.response?.data;
            const messageError = translation("errorApi.CHECKIN_CLIENT_FAILED");
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
            setOpenModalCheckIn(false);
            setLoading(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={openModalCheckIn}
                onClose={() => setOpenModalCheckIn(false)}
                onConfirm={onConfirmCheckIn}
                loading={loading}
                title={translation("label.titleCheckInAlert")}
                description=""
            />
            <AlertModal
                isOpen={openModalDelete}
                onClose={() => setOpenModalDelete(false)}
                onConfirm={onConfirmDelete}
                loading={loading}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-40"
                >
                    {isCheckIn ? (
                        <DropdownMenuItem
                            onClick={() => setOpenModalCheckIn(true)}
                            className="text-green-700"
                        >
                            <ScanBarcode className="mr-3 h-4 w-4" /> {translation("action.checkIn")}
                        </DropdownMenuItem>
                    ) : (
                        ""
                    )}
                    {isUpdate ? (
                        <DropdownMenuItem onClick={onRowSelected}>
                            <Edit className="mr-3 h-4 w-4" /> {translation("action.edit")}
                        </DropdownMenuItem>
                    ) : (
                        ""
                    )}
                    {isDelete ? (
                        <DropdownMenuItem
                            onClick={() => setOpenModalDelete(true)}
                            className="text-red-700"
                        >
                            <Trash className="mr-3 h-4 w-4" /> {translation("action.delete")}
                        </DropdownMenuItem>
                    ) : (
                        ""
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
