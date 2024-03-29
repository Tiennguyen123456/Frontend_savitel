﻿"use client";
import { ListCollapse } from "lucide-react";
import UserNav from "../UserNav";
import LocaleSwitcherSelect from "../LocaleSwitcherSelect";
import NotificationNav from "../NotificationNav";
import { useCommon } from "@/hooks/use-common";
import { DeviceType } from "@/constants/enum";

export default function TopBar() {
    const common = useCommon();

    const handleToggleSideBar = () => {
        common.deviceType === DeviceType.Desktop ? common.toggleCollapseSideBar() : common.toggleSideBar();
    };

    return (
        <div className="border-b shadow-md">
            <div className="flex h-16 items-center px-4 md:px-6">
                <ListCollapse
                    className="cursor-pointer w-6 h-6 opacity-75"
                    onClick={handleToggleSideBar}
                />
                <div className="ml-auto flex items-center space-x-4 md:space-x-6">
                    <LocaleSwitcherSelect />
                    <NotificationNav />
                    <UserNav />
                </div>
            </div>
        </div>
    );
}
