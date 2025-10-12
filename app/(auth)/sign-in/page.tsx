'use client';

import FooterLink from "@/components/form/FooterLink";
import InputField from "@/components/form/InputField";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const SignIn = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: ''
        },
        mode: 'onBlur'
    });
    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if (result.success) router.push('/');
        } catch (error) {
            console.error("Error during sign In:", error);
        }
    };

    return (
        <>
            <h1 className="form-title">Welcome Back</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <InputField
                    name="email"
                    label="Email"
                    // type="email"
                    placeholder="Enter your email"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: "Email is required", pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email address"
                        }
                    }}
                />

                <InputField
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: "Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" }
                    }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>

                <FooterLink
                    text="Don't have an account?"
                    linkText="Sign Up"
                    href="/sign-up"
                />

            </form>
        </>
    );
};
export default SignIn;