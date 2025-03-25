import { Controller } from "../Controller";

export class Claims extends Controller {
	@Controller.Docs("review an insurance claim")
	@Controller.Auth({ permission: "review_claim" })
	async review({ claimId }: { claimId: string }) {
		const requestContext = this.useRequestContext();

		const customerId = await getCustomerId(claimId);
		requestContext.logForCustomer = customerId;

		return {
			claimId,
			customerId,
			status: "pending",
		};
	}

	@Controller.Docs("Approve an insurance claim")
	@Controller.Auth({ permission: "approve_claim" })
	async approve({ claimId }: { claimId: string }) {
		const requestContext = this.useRequestContext();

		const customerId = await getCustomerId(claimId);
		requestContext.logForCustomer = customerId;

		return {
			claimId,
			status: "approved",
			lastUpdatedBy: requestContext.auth?.agentId,
		};
	}
}

function getCustomerId(claimId: string) {
	return "customer-id";
}
