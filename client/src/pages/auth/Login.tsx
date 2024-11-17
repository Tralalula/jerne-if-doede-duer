import { useAuth } from '../import';
import { LoginRequest } from '../../Api.ts';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const schema: yup.ObjectSchema<LoginRequest> = yup
    .object({
        email: yup.string().email("Email skal være gyldig").required("Email er påkrævet"),
        password: yup.string().min(6, "Adgangskode skal være mindst 6 tegn").required("Adgangskode er påkrævet"),
    })
    .required();

export default function LoginPage() {
    const { login } = useAuth();
    
    const { 
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) });
    
    const onSubmit: SubmitHandler<LoginRequest> = (data) => {
        toast.promise(login(data), {
            success: "Logget ind med succes",
            error: "Ugyldige loginoplysninger",
            loading: "Logger ind...",
        });
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">

                <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                    <form
                        className="card-body"
                        method="post"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Indtast email"
                                className={`input input-bordered ${errors.email ? "input-error" : ""}`}
                                {...register("email")}
                            />
                            {errors.email && (
                                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email.message}
                  </span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Adgangskode</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Indtast adgangskode"
                                className={`input input-bordered ${errors.password ? "input-error" : ""}`}
                                {...register("password")}
                            />
                            {errors.password && (
                                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                                </label>
                            )}
                            <label className="label">
                                <a href="#" className="label-text-alt link link-hover">
                                    Glemt adgangskode?
                                </a>
                            </label>
                        </div>

                        <div className="form-control mt-6">
                            <button className="btn btn-primary">Log ind</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}