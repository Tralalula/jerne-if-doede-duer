import { Toaster, ToastBar, resolveValue, toast } from "react-hot-toast";
import AlertIcon from "./AlertIcon";

export default function DaisyToaster() {
    return (
        <Toaster
            position="top-right"
            gutter={48}
            containerStyle={{
                marginTop: "128px",
            }}
        >
            {(t) => (
                <ToastBar toast={t}
                          style={{ background: "none", boxShadow: "none" }}>
                    {() => {
                        const alertClassMap: Record<string, string> = {
                            success: "alert-success",
                            error: "alert-error",
                            loading: "alert-warning",
                            blank: "alert-info",
                        };

                        const alertClass = alertClassMap[t.type] || "alert-info";

                        return (
                            <div className="toast cursor-pointer"
                                 onClick={() => toast.dismiss(t.id)}>
                                <div className={`alert ${alertClass}`}>
                                    <AlertIcon type={t.type} />
                                    <span className="ml-2">{resolveValue(t.message, t)}</span>
                                </div>
                            </div>
                        );
                    }}
                </ToastBar>
            )}
        </Toaster>
    );
}