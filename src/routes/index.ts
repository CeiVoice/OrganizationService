import { Router, Request, Response } from 'express';
import OrganizationController from '../controllers/Organization.controller';
import MemberController from '../controllers/Member.controller';
import jwt from "jsonwebtoken"
import { authenticateToken, ensureOwnUser } from '../middleware';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Organization ID
 *           example: 1
 *         Orgname:
 *           type: string
 *           description: Organization name
 *           example: "KMITL Computer Engineering"
 *         CreateAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         UpdateAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     Member:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Member ID
 *           example: 1
 *         OrganizationId:
 *           type: integer
 *           description: Organization ID
 *           example: 1
 *         UserId:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         InviteAt:
 *           type: string
 *           format: date-time
 *           description: Invitation timestamp
 *         isAdmin:
 *           type: boolean
 *           description: Admin privileges
 *           example: false
 *         DeptName:
 *           type: string
 *           description: Department name
 *           nullable: true
 *           example: "Engineering"
 *     CreateOrganizationRequest:
 *       type: object
 *       required:
 *         - Orgname
 *       properties:
 *         Orgname:
 *           type: string
 *           description: Organization name
 *           example: "KMITL Computer Engineering"
 *     CreateMemberRequest:
 *       type: object
 *       required:
 *         - OrganizationId
 *         - UserId
 *       properties:
 *         OrganizationId:
 *           type: integer
 *           description: Organization ID
 *           example: 1
 *         UserId:
 *           type: integer
 *           description: User ID to add as member
 *           example: 1
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         details:
 *           type: string
 *           description: Detailed error information
 *   responses:
 *     UnauthorizedError:
 *       description: Authorization information is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     NotFoundError:
 *       description: The requested resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *
 * security:
 *   - bearerAuth: []
 */
const router = Router();




/**
 * @swagger
 * /organization:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Create Organization
 *     description: Create a new organization. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrganizationRequest'
 *     responses:
 *       200:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Create organization
router.post("/organization", async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Invalid or missing user in token" });
        }
        const { Orgname } = req.body;
        if (!Orgname) {
            return res.status(400).json({ error: "Orgname is required in body" });
        }
        const payload = {
            OrgName: Orgname,
            UserId: decoded.id
        };
        const result = await OrganizationController.CreateNewOrg(payload);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /organization/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get Organization by ID
 *     description: Retrieve organization details by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Organization retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Get organization by id
router.get("/organization/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid organization id" });
        }
        const result = await OrganizationController.GetOrgById(id);
        if (!result) {
            return res.status(404).json({ error: "Organization not found" });
        }
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /organization/user/{userId}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get Organizations by User ID
 *     description: Retrieve all organizations that a user is a member of
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/organization/user/:userId", async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }
        const result = await OrganizationController.GetOrgsByUserId(userId);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /organization/{id}:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Update Organization
 *     description: Update organization details
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Orgname:
 *                 type: string
 *                 description: Organization name
 *                 example: "Updated Organization Name"
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Update organization
router.put("/organization/:id", async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Invalid or missing user in token" });
        }
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid organization id" });
        }
        const data = req.body;
        const result = await OrganizationController.UpdateOrg(id, decoded.id, data);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /organization/{id}:
 *   delete:
 *     tags:
 *       - Organizations
 *     summary: Delete Organization
 *     description: Delete an organization by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   description: Deletion result
 *       400:
 *         description: Invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Delete organization
router.delete("/organization/:id", async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Invalid or missing user in token" });
        }
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid organization id" });
        }
        const result = await OrganizationController.DeleteOrg(id, decoded.id);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /member:
 *   post:
 *     tags:
 *       - Members
 *     summary: Add Member to Organization
 *     description: Add a new member to an organization. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMemberRequest'
 *     responses:
 *       200:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// Member routes
router.post("/member", async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Invalid or missing user in token" });
        }
        const rawPayload = req.body;
        const payload = {
            "OrganizationId": rawPayload.OrganizationId,
            "UserId": rawPayload.UserId,
            "Admin": decoded.id,
            "isAdmin": decoded.isAdmin
        }
        const result = await MemberController.CreateNewMember(payload);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /member/{id}:
 *   get:
 *     tags:
 *       - Members
 *     summary: Get Member by ID
 *     description: Retrieve member details by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Member ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Member retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Invalid member ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/member/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid member id" });
        }
        const result = await MemberController.GetMemberById(id);
        if (!result) {
            return res.status(404).json({ error: "Member not found" });
        }
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /member/user/{userId}:
 *   get:
 *     tags:
 *       - Members
 *     summary: Get Member by User ID
 *     description: Retrieve member details by user ID
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Member retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/member/user/:userId", authenticateToken, ensureOwnUser, async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        const result = await MemberController.GetMemberByUserId(userId);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /member/org/{orgId}:
 *   get:
 *     tags:
 *       - Members
 *     summary: Get Members by Organization ID
 *     description: Retrieve all members of an organization
 *     parameters:
 *       - name: orgId
 *         in: path
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *       400:
 *         description: Invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/member/org/:orgId", async (req: Request, res: Response) => {
    try {
        const orgId = Number(req.params.orgId);
        if (isNaN(orgId)) {
            return res.status(400).json({ error: "Invalid organization id" });
        }
        const result = await MemberController.GetMemberByOrgId(orgId);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /member/{id}:
 *   put:
 *     tags:
 *       - Members
 *     summary: Update Member
 *     description: Update member details
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Member ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAdmin:
 *                 type: boolean
 *                 description: Admin privileges
 *                 example: true
 *               DeptName:
 *                 type: string
 *                 description: Department name
 *                 example: "Engineering"
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Invalid member ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/member/:id", async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Invalid or missing user in token" });
        }
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid member id" });
        }
        const data = req.body;
        const result = await MemberController.UpdateMember(id, decoded.id, data);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

/**
 * @swagger
 * /member/{id}:
 *   delete:
 *     tags:
 *       - Members
 *     summary: Delete Member
 *     description: Remove a member from organization
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Member ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   description: Deletion result
 *       400:
 *         description: Invalid member ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/member/:id", async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Invalid or missing user in token" });
        }
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid member id" });
        }
        const result = await MemberController.DeleteMember(id, decoded.id);
        return res.json({ ok: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
    }
});

export default router;