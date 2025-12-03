import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SiteHeader from "@/components/layout/site-header";
import { Separator } from "@/components/ui/separator";

export default function LeaseContractPage() {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-background">
            <SiteHeader />
            <main className="container mx-auto px-4 py-12">
                <Card className="max-w-4xl mx-auto shadow-2xl">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="font-headline text-3xl text-center">Digital Rental Agreement</CardTitle>
                        <CardDescription className="text-center">This is a legally binding document. Please review carefully before signing.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="text-sm">
                            <p><strong>Effective Date:</strong> {today}</p>
                            <p><strong>Property:</strong> Modern Family Home in Woodlands, Lusaka</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-headline font-semibold text-lg mb-2">Parties</h3>
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    <h4 className="font-bold">Landlord</h4>
                                    <p>John Landlord</p>
                                    <p>landlord@example.com</p>
                                </div>
                                <div>
                                    <h4 className="font-bold">Tenant</h4>
                                    <p>Jane Tenant</p>
                                    <p>tenant@example.com</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-headline font-semibold text-lg mb-2">Terms</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm">
                                <li><strong>Lease Term:</strong> 12 months, starting {today}.</li>
                                <li><strong>Monthly Rent:</strong> ZMW 25,000.00, due on the 1st of each month.</li>
                                <li><strong>Security Deposit:</strong> ZMW 50,000.00, due upon signing.</li>
                                <li><strong>Use of Premises:</strong> The property will be used for residential purposes only.</li>
                                <li><strong>Maintenance:</strong> Landlord is responsible for structural repairs. Tenant is responsible for minor repairs and general upkeep.</li>
                                <li><strong>Termination:</strong> A 30-day written notice is required by either party to terminate the lease after the initial term.</li>
                            </ul>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-headline font-semibold text-lg mb-4">Signatures</h3>
                            <p className="text-sm text-muted-foreground mb-4">By typing your full name below, you agree to the terms and conditions outlined in this agreement. This serves as your digital signature.</p>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="tenant-signature">Tenant Signature</Label>
                                    <Input id="tenant-signature" placeholder="Type your full name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="landlord-signature">Landlord Signature</Label>
                                    <Input id="landlord-signature" placeholder="Type your full name" disabled value="John Landlord" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 p-6 flex justify-end">
                        <Button size="lg" asChild>
                            <a href="/lease/checkout">Agree & Proceed to Payment</a>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
