import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getCourseById } from "@/redux/slice/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard } from "lucide-react";
import axiosInstance from "@/lib/axios";

const Purchase = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { currentCourse: course, status } = useAppSelector((state) => state.course);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!user) {
            toast.error("Please login to continue");
            navigate("/login");
            return;
        }

        if (id) {
            dispatch(getCourseById(id));
        }
    }, [id, user, dispatch, navigate]);

    const handlePayment = async () => {
        if (!user || !course) return;

        try {
            setProcessing(true);

            // Generate a demo transaction ID
            const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const transactionId = `TXN_UPI_${timestamp}_${random}`;

            const payload = {
                method: "upi",
                amount: course.price,
                userId: user._id,
                transactionId: transactionId,
                courseId: course._id
            };

            const response = await axiosInstance.post("/transaction", payload);

            if (response.data.success) {
                toast.success("Payment successful! Course added to your account.");
                navigate(`/course/${id}`);
            } else {
                toast.error(response.data.message || "Payment failed");
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(error?.response?.data?.message || "Payment failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="animate-pulse text-lg">Loading...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
                <Link to="/courses">
                    <Button>Browse All Courses</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
            <div className="container px-4 mx-auto">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        className="mb-6"
                        onClick={() => navigate(`/course/${id}`)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Course
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Complete Your Purchase</h1>
                        <p className="text-muted-foreground mb-8">
                            You're one step away from starting your learning journey
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Course Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Details</CardTitle>
                                    <CardDescription>Review your purchase</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{course.level || "Basic"}</Badge>
                                        <Badge variant="secondary">
                                            {(course as any).modules?.length || 0} Modules
                                        </Badge>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-muted-foreground">Course Price</span>
                                            <span className="font-medium">₹{course.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-muted-foreground">Taxes & Fees</span>
                                            <span className="font-medium">₹0</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-lg">Total Amount</span>
                                                <span className="font-bold text-2xl text-primary">₹{course.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method (Demo) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                    <CardDescription>Demo payment - Click pay to complete</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                            <span className="font-medium">UPI Payment (Demo)</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            This is a demo payment. No actual transaction will be processed.
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <Button
                                            onClick={handlePayment}
                                            disabled={processing}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="animate-spin mr-2">⏳</span>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Pay ₹{course.price}
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-xs text-center text-muted-foreground">
                                            By completing this purchase, you agree to our terms and conditions
                                        </p>
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="font-medium text-sm mb-2">What you'll get:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>✓ Lifetime access to course content</li>
                                            <li>✓ All {(course as any).modules?.length || 0} modules</li>
                                            <li>✓ Learn at your own pace</li>
                                            <li>✓ Certificate of completion</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Purchase;
