"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react";
import NavItems from "@/components/NavItems";
import { signOut } from "@/lib/actions/auth.actions";

const UserDropdown = ({ user, initialStocks }: { user: User, initialStocks: StockWithWatchlistStatus[] }) => {
    const router = useRouter();

    const handelSingOut = async () => {
        await signOut();
        router.push("/sign-in");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex rounded-full items-center gap-3 text-gray-400 hover:text-yellow-500">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwO9P2kZOn-E7sYpB5YEpLyOZjleIPN-sAOw&s" />
                        <AvatarFallback className="bg-yellow-500 text-yellow-900">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-400">
                            {user.name}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="text-gray-400">

                <DropdownMenuLabel>
                    <div className="flex relative items-center gap-3 py-2">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwO9P2kZOn-E7sYpB5YEpLyOZjleIPN-sAOw&s" />
                            <AvatarFallback className="bg-yellow-500 text-yellow-900">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-400">
                                {user.name}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-gray-600"/>

                <DropdownMenuItem className="text-gray-100 text-md focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer" onClick={handelSingOut}>
                    <LogOut className="mr-2 h-4 w-4 hidden sm:block" />
                    Logout
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-600 hidden sm:block"/>

                <nav className="sm:hidden">
                    <NavItems initialStocks={initialStocks} />
                </nav>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;