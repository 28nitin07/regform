"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from '@/app/styles/spinner.module.css';
import { post } from "@/app/utils/PostGetData";

/* eslint-disable @typescript-eslint/no-unused-vars */
interface FormData {
    universityName: string;
    phone: string;
}

export default function UniversityNamePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({ universityName: "", phone: "" });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const validateForm = (): boolean => {
        const phoneRegex = /^[0-9]{10}$/;

        if (!formData.universityName) {
            setError("University name is required.");
            return false;
        }

        if (!phoneRegex.test(formData.phone)) {
            setError("Please enter a valid 10-digit phone number.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Sending the university name and phone number to the backend API
            const { data, error } = await post<{ message: string }>("/api/auth/google/SaveUniversity", formData);

            if (data) {
                setSuccess(data.message);
                router.push("/dashboard"); // Redirect to the dashboard on success
            } else if (error) {
                setError(error?.error || "Something went wrong.");
            }
        } catch (err) {
            setError("Failed to connect to the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
  <CardTitle>
    Enter University
  </CardTitle>
</CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="universityName">College/University Name</Label>
                            <Input
                                id="universityName"
                                type="text"
                                placeholder="e.g., DU – St. Stephen's College"
                                value={formData.universityName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="10-digit phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        {success && <p className="text-green-500">{success}</p>}
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
                >
                    {isLoading ? <div className={styles.spinner}></div> : "Submit"}
                </Button>
            </CardFooter>
        </Card>
    );
}
