import { client } from "@/bff/client";
import { useRouter } from "next/router";
import { type FC, useEffect, useState } from "react";

export default function Page() {
	const router = useRouter();

	const [claim, setClaim] = useState<{
		claimId: string;
		customerId: string;
		status: string;
	} | null>(null);

	useEffect(() => {
		const claimId = router.query.id;

		if (typeof claimId === "string") {
			client.rpc.claims.review({ claimId }).then((claim) => setClaim(claim));
		}

		return () => {};
	}, [router]);

	return (
		<div>
			<h1>Claim</h1>
			{claim ? (
				<>
					<p>Claim ID: {claim.claimId}</p>
					<p>Customer ID: {claim.customerId}</p>
					<p>Status: {claim.status}</p>
				</>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
}
