import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SiteHeader from "@/components/layout/site-header";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Landmark } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    return (
        <div className="bg-background">
            <SiteHeader />
            <main className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="md:col-span-2">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Secure Checkout</CardTitle>
                                <CardDescription>Complete your payment to secure your new home.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-4">Select Payment Method</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" className="h-20 flex-col gap-2 justify-center">
                                            <CreditCard />
                                            Credit/Debit Card
                                        </Button>
                                         <Button variant="outline" className="h-20 flex-col gap-2 justify-center">
                                            <Landmark />
                                            Bank Transfer
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-4">Card Details</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="card-number">Card Number</Label>
                                            <Input id="card-number" placeholder="**** **** **** 1234" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry">Expiry Date</Label>
                                                <Input id="expiry" placeholder="MM / YY" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvc">CVC</Label>
                                                <Input id="cvc" placeholder="123" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-1">
                        <Card className="sticky top-24 shadow-lg">
                             <CardHeader>
                                <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Security Deposit</span>
                                    <span className="font-medium">ZMW 50,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>First Month's Rent</span>
                                    <span className="font-medium">ZMW 25,000</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Due Today</span>
                                    <span className="text-primary">ZMW 75,000</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" asChild>
                                    <Link href="/">Pay Now</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
