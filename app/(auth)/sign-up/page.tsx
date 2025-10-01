'use client';

import { CountrySelectField } from "@/components/form/CountrySelectField";
import FooterLink from "@/components/form/FooterLink";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import { Button } from "@/components/ui/button";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import { useForm } from "react-hook-form";

const SignUp = () => {
    const { 
        register, 
        handleSubmit, 
        control, 
        formState: { errors, isSubmitting } } = useForm<SignUpFormData>({
            defaultValues: {
                fullName: '',
                email: '',
                password: '',
                country: 'India',
                investmentGoals: 'Growth',
                riskTolerance: 'Medium',
                preferredIndustry: 'Technology'
            },
            mode: 'onBlur'
        });
    const onSubmit = async(data: SignUpFormData) => {
        try {
            console.log("Form Data:", data);
            
        } catch (error) {
            console.error("Error during sign up:", error);         
        }
    };

    return (
        <>
            <h1 className="form-title">Sign Up & Personalize</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <InputField 
                    name="fullName"
                    label="Full Name"
                    placeholder="Enter your full name"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: "Full name is required" , minLength:2}}
                />

                <InputField 
                    name="email"
                    label="Email"
                    // type="email"
                    placeholder="Enter your email"
                    register={register}
                    error={errors.email}
                    validation={{ required: "Email is required" , pattern: /^\W+@\.\W+$/, message: "Invalid email address" }}
                />

                <InputField 
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    register={register}
                    error={errors.password}
                    validation={{ required: "Password is required" , minLength:8, message: "Password must be at least 8 characters" }}
                />

                <CountrySelectField
                    name="country"
                    label="Country"
                    control={control}
                    error={errors.country}
                    required
                />

                <SelectField 
                    name="investmentGoals"
                    label="Investment Goals"
                    placeholder="Select your investment goals"
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                    required
                />

                <SelectField 
                    name="riskTolerance"
                    label="Risk Tolerance"
                    placeholder="select your risk level"
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                    required
                />

                <SelectField 
                    name="preferredIndustry"
                    label="Preferred Industry"
                    placeholder="Select your preferred industry"
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.preferredIndustry}
                    required
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Creating account' : 'Start Your Investing Journey'}
                </Button>

                <FooterLink
                    text="Already have an account?"
                    linkText="Sign In"
                    href="/sign-in"
                 />
            </form>
        </>
    );
};
export default SignUp;                  