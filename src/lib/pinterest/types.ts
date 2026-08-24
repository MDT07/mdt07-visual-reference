export interface PinterestImage {
  width: number;
  height: number;
  url: string;
}

export interface PinterestImages {
  "150x150"?: PinterestImage;
  "400x300"?: PinterestImage;
  "600x"?: PinterestImage;
  "1200x"?: PinterestImage;
}

export interface PinterestVideo {
  video_url?: string;
  duration?: number;
  height?: number;
  width?: number;
}

export interface PinterestMedia {
  media_type: "image" | "video";
  images?: PinterestImages;
  video?: PinterestVideo;
}

export interface PinterestBoardOwner {
  username?: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  privacy?: "PUBLIC" | "PROTECTED" | "SECRET";
  pin_count?: number;
  owner?: PinterestBoardOwner;
}

export interface PinterestPin {
  id: string;
  board_id?: string;
  title?: string;
  description?: string;
  alt_text?: string;
  link?: string;
  dominant_color?: string;
  media: PinterestMedia;
  board_owner?: PinterestBoardOwner;
  created_at?: string;
  has_been_promoted?: boolean;
  is_owner?: boolean;
  is_product?: boolean;
  is_standard?: boolean;
  parent_pin_id?: string;
}

export interface PinterestSearchResponse {
  items: PinterestPin[];
  bookmark?: string | null;
}

export interface PinterestBoardsResponse {
  items: PinterestBoard[];
  bookmark?: string | null;
}

export interface PinterestTokenResponse {
  access_token: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  refresh_token_expires_at?: number;
  response_type?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface PinterestErrorResponse {
  status?: string;
  code?: number;
  message?: string;
  detail?: string;
}

export interface CuratedPin {
  id: string;
  pinterestId: string;
  title?: string;
  description?: string;
  altText?: string;
  link?: string;
  sourceUrl: string;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  dominantColor?: string;
  authorUsername?: string;
  mediaType: "image" | "video";
  query: string;
  savedAt: string;
}

export interface VisualReference {
  id: string;
  source: "pinterest";
  sourceId: string;
  sourceUrl: string;

  title?: string;
  description?: string;
  altText?: string;

  imageUrl?: string;
  thumbnailUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: number;
  dominantColor?: string;

  link?: string;
  authorUsername?: string;
  boardId?: string;
  boardName?: string;

  creativeType?: string;
  tags?: string[];

  designAttributes?: {
    layout?: string[];
    typography?: string[];
    colorPalette?: string[];
    imagery?: string[];
    navigation?: string[];
    effects?: string[];
    composition?: string[];
    spacing?: string[];
    motion?: string[];
  };

  relevanceScore?: number;
  qualityScore?: number;
  finalScore?: number;

  rawQuery?: string;
  fetchedAt: string;
}
