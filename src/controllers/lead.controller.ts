import { Request, Response } from "express";
import { listLeads, createLead, updateLeadByPhone, getLeadByPhone } from "../services/lead.service";
import { successResponse, errorResponse } from "../utills/response";
import { exportToExcel, ExcelColumn } from "../utills/excelExport";

export const getLeads = async (req: Request, res: Response) => {
  try {
    // Check if phone parameter is provided - if so, fetch by phone instead
    const phone = req.query.phone as string;
    console.log(phone,"phone")
    console.log(typeof phone,"typeof phone")
    if (phone) {
      const leads = await getLeadByPhone(phone);
      return successResponse(res, leads, "Leads fetched successfully");
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate.trim() : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;

    const data = await listLeads(page, limit, { search, fromDate, toDate });
    return successResponse(res, data, "Leads fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching leads:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch leads",
      error?.statusCode || 500
    );
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const lead = await createLead(req.body);
    return successResponse(res, lead, "Lead created successfully", 201);
  } catch (error: any) {
    console.error("❌ Error creating lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to create lead",
      error?.statusCode || 400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const lead = await updateLeadByPhone(req.body);
    return successResponse(res, lead, "Lead updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to update lead",
      error?.statusCode || 400
    );
  }
};

export const exportLeads = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate.trim() : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;

    // Fetch all leads with filters (using high limit for export)
    // listLeads already maps DB columns to question keys, so we use the data as-is
    const data = await listLeads(1, 100000, { search, fromDate, toDate });
    const leads = data.data || [];

    // Define Excel columns matching the frontend table
    const columns: ExcelColumn[] = [
      { key: "name", header: "Name", width: 20 },
      { key: "email", header: "Email", width: 25 },
      { key: "phone", header: "Phone", width: 15 },
      { key: "course", header: "Course", width: 20 },
      { key: "university", header: "University", width: 20 },
      { key: "specialisation", header: "Specialisation", width: 20 },
      { key: "state", header: "State", width: 15 },
      { key: "city", header: "City", width: 15 },
      { key: "lead_source", header: "Lead Source", width: 15 },
      { key: "sub_source", header: "Sub Source", width: 15 },
      { key: "highest_qualification", header: "Highest Qualification", width: 20 },
      {
        key: "what_is_your_preferred_budget_for_the_total_course_fee",
        header: "Preferred Budget",
        width: 20,
      },
      {
        key: "would_you_prefer_to_convert_the_course_fee_into_easy_emis",
        header: "EMI Required",
        width: 15,
      },
      {
        key: "what_is_your_current_annual_salary_package",
        header: "Salary",
        width: 15,
      },
      {
        key: "what_was_your_percentage_in_graduation",
        header: "Percentage",
        width: 15,
      },
      {
        key: "how_many_years_of_experience_do_you_have",
        header: "Experience",
        width: 15,
      },
      {
        key: "are_you_currently_employed",
        header: "Currently Employed",
        width: 18,
      },
      {
        key: "are_you_looking_for_a_university_that_can_help_you_with_placement_salary_hike_or_promotions",
        header: "University for Placement/Salary Hike/Promotions",
        width: 35,
      },
      { key: "utm_source", header: "UTM Source", width: 15 },
      { key: "utm_campaign", header: "UTM Campaign", width: 15 },
      { key: "utm_adgroup", header: "UTM Ad Group", width: 15 },
      { key: "utm_ads", header: "UTM Ads", width: 15 },
      { key: "website_url", header: "Website URL", width: 30 },
      {
        key: "created_on",
        header: "Created On",
        width: 20,
        getValue: (row) => {
          if (!row.created_on) return "-";

          // Use a fixed timezone (Asia/Kolkata) so export matches what you see in the UI
          // UI runs in your browser timezone (likely IST), while server is often UTC.
          const date = new Date(row.created_on);
          if (isNaN(date.getTime())) return "-";

          const datePart = date.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
          });

          const timePart = date.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          });

          return `${datePart} ${timePart}`;
        },
      },
    ];

    await exportToExcel(res, leads, columns, "Leads");
  } catch (error: any) {
    console.error("❌ Error exporting leads:", error);
    return errorResponse(
      res,
      error?.message || "Failed to export leads",
      error?.statusCode || 500
    );
  }
};


