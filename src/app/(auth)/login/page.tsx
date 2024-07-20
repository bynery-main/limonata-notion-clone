"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from '@/lib/types'; // Might need to change this path to be more specific

const LoginPage = () => {
    const router = useRouter();
    const [submitError, setSubmitError] = useState('');

    const form = useForm<z.infer<typeof FormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: { email: '', password: '' },    
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
        formData
    ) => {};

    return <div>login</div>
}

export default LoginPage;