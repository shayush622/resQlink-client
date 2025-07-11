
export type LiveKitPayload =
  | {
      type: "resources_updated";
      data: {
        disaster_id: string;
        resource_id: string;
        resource_type: string;
        summary: string;
        updated_at: string;
      };
    }
  | {
      type: "social_media_updated";
      data: {
        disaster_id: string;
        source: string;
        summary: string;
        fetched_at: string;
      };
    }
  | {
      type: "disaster_updated";
      data: {
        disaster_id: string;
        action: "created" | "updated" | "deleted";
        title: string;
        description: string;
        location: {
          type: "Point";
          coordinates: [number, number];
        };
        created_at: string;
      };
    }
  | {
      type: "report_added";
      data: {
        disaster_id: string;
        report_id: string;
        content: string;
        user_id: string;
        image_url?: string;
        verification_status: string;
        created_at: string;
      };
    }
  | {
       type: "report_updated";
    data: {
      disaster_id: string;
      report_id: string;
      content: string;
      user_id: string;
      image_url?: string;
      verification_status: string;
      created_at: string;
    };
    }
  | {
      type: "official_update_added";
      data: {
        disaster_id: string;
        update_id: string;
        title: string;
        description: string;
        posted_by: string;
        created_at: string;
      };
    };

