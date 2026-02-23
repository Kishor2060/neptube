import Link from "next/link";
import { Button } from "@/components/ui/button";

const Page = ()=>{
    return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="glass-card p-8 rounded-xl shadow-lg flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-foreground mb-4">Protected Page</h1>
                        <p className="text-muted-foreground mb-6">You must be signed in to view this page.</p>
                        <Link href="/auth/sign-in">
                            <Button>Sign In</Button>
                        </Link>
                    </div>
                </div>
    )
}

export default Page;