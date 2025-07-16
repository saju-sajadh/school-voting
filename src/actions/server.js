"use server";

import connectDB from "@/dbconfig";
import ElectionModel from "@/models/electionmodel";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

// Initialize Supabase client for image storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing in environment variables");
  }
  return createClient(supabaseUrl, supabaseKey);
}

export async function getElectionTitles() {
  try {
    await connectDB();
    const elections = await ElectionModel.find({}, "title");
    const titles = elections.map((e) => e.title);
    console.log("Fetched election titles:", titles);
    return { titles };
  } catch (error) {
    console.error("Error fetching election titles:", error.stack);
    return { error: "Failed to fetch election titles: " + error.message };
  }
}

export async function getElection(electionTitle) {
  try {
    await connectDB();
    console.log("Fetching election with title:", electionTitle);
    const allElections = await ElectionModel.find({}, "title");
    console.log(
      "All election titles in DB:",
      allElections.map((e) => e.title)
    );
    const election = await ElectionModel.findOne(
      { title: { $regex: new RegExp(`^${electionTitle}$`, "i") } },
      "title categories"
    );
    if (!election) {
      return { error: "Election not found" };
    }
    // Ensure categories is an array, default to empty if null or undefined
    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    return {
      title: election.title,
      categories: categories.map((category) => ({
        title: category.title,
        nominees: Array.isArray(category.nominees)
          ? category.nominees.map((nominee) => ({
              name: nominee.name,
              photo: nominee.photo || null, // Changed to null
              logo: nominee.logo || null, // Changed to null
              votes: nominee.votes || 0,
            }))
          : [],
      })),
    };
  } catch (error) {
    console.error("Error fetching election:", error.stack);
    return { error: "Failed to fetch election: " + error.message };
  }
}

export async function verifyElectionPassword(title, password) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (!election) {
      return { valid: false, error: "Election not found" };
    }
    const isValid = await bcrypt.compare(password, election.password);
    return { valid: isValid, error: isValid ? null : "Invalid password" };
  } catch (error) {
    console.error("Error verifying password:", error.stack);
    return {
      valid: false,
      error: "Failed to verify password: " + error.message,
    };
  }
}

export async function createElection(title, password) {
  try {
    await connectDB();
    const existingElection = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (existingElection) {
      return { error: "Election already exists" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await ElectionModel.create({
      title,
      password: hashedPassword,
      categories: [],
    });
    console.log("Created election:", title);
    return { message: "Election created successfully" };
  } catch (error) {
    console.error("Error creating election:", error.stack);
    return { error: "Failed to create election: " + error.message };
  }
}

export async function addCategory(electionTitle, categoryTitle, password) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${electionTitle}$`, "i") },
    });
    if (!election) {
      return { error: "Election not found" };
    }
    const isValid = await bcrypt.compare(password, election.password);
    if (!isValid) {
      return { error: "Invalid election password" };
    }
    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    if (categories.some((cat) => cat.title === categoryTitle)) {
      return { error: "Category already exists in this election" };
    }
    const result = await ElectionModel.updateOne(
      { title: electionTitle },
      { $push: { categories: { title: categoryTitle, nominees: [] } } }
    );
    if (result.matchedCount === 0) {
      return { error: "Election not found" };
    }
    console.log("Added category:", categoryTitle, "to", electionTitle);
    return { message: "Category added successfully" };
  } catch (error) {
    console.error("Error adding category:", error.stack);
    return { error: "Failed to add category: " + error.message };
  }
}

export async function updateCategory({
  electionTitle,
  originalCategoryTitle,
  newCategoryTitle,
  password,
}) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${electionTitle}$`, "i") },
    });
    if (!election) {
      return { error: "Election not found" };
    }
    const isValid = await bcrypt.compare(password, election.password);
    if (!isValid) {
      return { error: "Invalid election password" };
    }
    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    if (
      categories.some(
        (cat) =>
          cat.title === newCategoryTitle &&
          originalCategoryTitle !== newCategoryTitle
      )
    ) {
      return { error: "Category title already exists" };
    }
    const result = await ElectionModel.updateOne(
      { title: electionTitle, "categories.title": originalCategoryTitle },
      { $set: { "categories.$.title": newCategoryTitle } }
    );
    if (result.matchedCount === 0) {
      return { error: "Category or election not found" };
    }
    console.log(
      "Updated category:",
      originalCategoryTitle,
      "to",
      newCategoryTitle,
      "in",
      electionTitle
    );
    return { message: "Category updated successfully" };
  } catch (error) {
    console.error("Error updating category:", error.stack);
    return { error: "Failed to update category: " + error.message };
  }
}

export async function deleteCategory(electionTitle, categoryTitle, password) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${electionTitle}$`, "i") },
    });
    if (!election) {
      return { error: "Election not found" };
    }
    const isValid = await bcrypt.compare(password, election.password);
    if (!isValid) {
      return { error: "Invalid election password" };
    }
    const result = await ElectionModel.updateOne(
      { title: electionTitle },
      { $pull: { categories: { title: categoryTitle } } }
    );
    if (result.matchedCount === 0) {
      return { error: "Category or election not found" };
    }
    console.log("Deleted category:", categoryTitle, "from", electionTitle);
    return { message: "Category deleted successfully" };
  } catch (error) {
    console.error("Error deleting category:", error.stack);
    return { error: "Failed to delete category: " + error.message };
  }
}

export async function deleteElection(title, password) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (!election) {
      return { error: "Election not found" };
    }
    const isValid = await bcrypt.compare(password, election.password);
    if (!isValid) {
      return { error: "Invalid election password" };
    }
    const result = await ElectionModel.deleteOne({ title });
    if (result.deletedCount === 0) {
      return { error: "Election not found" };
    }
    console.log("Deleted election:", title);
    return { message: "Election deleted successfully" };
  } catch (error) {
    console.error("Error deleting election:", error.stack);
    return { error: "Failed to delete election: " + error.message };
  }
}

export async function addCandidate({
  electionTitle,
  categoryTitle,
  candidateName,
  photoFile,
  logoFile,
}) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${electionTitle}$`, "i") },
    });
    if (!election) {
      return { error: "Election not found" };
    }
    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    const category = categories.find((cat) => cat.title === categoryTitle);
    if (!category) {
      return { error: "Category not found" };
    }
    if (category.nominees.some((nominee) => nominee.name === candidateName)) {
      return { error: "Candidate already exists in this category" };
    }

    const supabase = await createSupabaseClient();
    let photoUrl = "";
    let logoUrl = "";
    const uploadedFiles = [];

    // Upload photo
    if (photoFile) {
      const photoFileExt = photoFile.name.split(".").pop();
      const photoFileName = `photo_${Date.now()}.${photoFileExt}`;
      const { error: photoUploadError } = await supabase.storage
        .from("election")
        .upload(photoFileName, photoFile);
      if (photoUploadError) {
        console.error("Photo upload error:", photoUploadError);
        return { error: `Failed to upload photo: ${photoUploadError.message}` };
      }
      const { data: photoData } = supabase.storage
        .from("election")
        .getPublicUrl(photoFileName);
      photoUrl = photoData.publicUrl;
      uploadedFiles.push(photoFileName);
    }

    // Upload logo
    if (logoFile) {
      const logoFileExt = logoFile.name.split(".").pop();
      const logoFileName = `logo_${Date.now()}.${logoFileExt}`;
      const { error: logoUploadError } = await supabase.storage
        .from("election")
        .upload(logoFileName, logoFile);
      if (logoUploadError) {
        console.error("Logo upload error:", logoUploadError);
        // Clean up uploaded photo if logo upload fails
        if (photoUrl) {
          await supabase.storage.from("election").remove([uploadedFiles[0]]);
        }
        return { error: `Failed to upload logo: ${logoUploadError.message}` };
      }
      const { data: logoData } = supabase.storage
        .from("election")
        .getPublicUrl(logoFileName);
      logoUrl = logoData.publicUrl;
      uploadedFiles.push(logoFileName);
    }

    const result = await ElectionModel.updateOne(
      { title: electionTitle, "categories.title": categoryTitle },
      {
        $push: {
          "categories.$.nominees": {
            name: candidateName,
            photo: photoUrl || null, // Changed to null
            logo: logoUrl || null, // Changed to null
            votes: 0,
          },
        },
      }
    );
    if (result.matchedCount === 0) {
      // Clean up uploaded files if database update fails
      if (uploadedFiles.length > 0) {
        await supabase.storage.from("election").remove(uploadedFiles);
      }
      return { error: "Category or election not found" };
    }
    console.log(
      "Added candidate:",
      candidateName,
      "to category:",
      categoryTitle,
      "in",
      electionTitle
    );
    return { message: "Candidate added successfully" };
  } catch (error) {
    console.error("Error adding candidate:", error.stack);
    return { error: "Failed to add candidate: " + error.message };
  }
}

export async function updateCandidate({
  electionTitle,
  categoryTitle,
  originalName,
  newName,
  newPhotoFile,
  newLogoFile,
}) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${electionTitle}$`, "i") },
    });
    if (!election) {
      return { error: "Election not found" };
    }
    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    const category = categories.find((cat) => cat.title === categoryTitle);
    if (!category) {
      return { error: "Category not found" };
    }
    if (
      category.nominees.some(
        (nominee) => nominee.name === newName && originalName !== newName
      )
    ) {
      return { error: "Candidate name already exists in this category" };
    }

    const supabase = await createSupabaseClient();
    let photoUrl = category.nominees.find(
      (nominee) => nominee.name === originalName
    )?.photo;
    let logoUrl = category.nominees.find(
      (nominee) => nominee.name === originalName
    )?.logo;
    const uploadedFiles = [];

    // Upload new photo if provided
    if (newPhotoFile) {
      const photoFileExt = newPhotoFile.name.split(".").pop();
      const photoFileName = `photo_${Date.now()}.${photoFileExt}`;
      const { error: photoUploadError } = await supabase.storage
        .from("election")
        .upload(photoFileName, newPhotoFile);
      if (photoUploadError) {
        console.error("Photo upload error:", photoUploadError);
        return { error: `Failed to update photo: ${photoUploadError.message}` };
      }
      const { data: photoData } = supabase.storage
        .from("election")
        .getPublicUrl(photoFileName);
      photoUrl = photoData.publicUrl;
      uploadedFiles.push(photoFileName);
    }

    // Upload new logo if provided
    if (newLogoFile) {
      const logoFileExt = newLogoFile.name.split(".").pop();
      const logoFileName = `logo_${Date.now()}.${logoFileExt}`;
      const { error: logoUploadError } = await supabase.storage
        .from("election")
        .upload(logoFileName, newLogoFile);
      if (logoUploadError) {
        console.error("Logo upload error:", logoUploadError);
        if (uploadedFiles.length > 0) {
          await supabase.storage.from("election").remove(uploadedFiles);
        }
        return { error: `Failed to update logo: ${logoUploadError.message}` };
      }
      const { data: logoData } = supabase.storage
        .from("election")
        .getPublicUrl(logoFileName);
      logoUrl = logoData.publicUrl;
      uploadedFiles.push(logoFileName);
    }

    const result = await ElectionModel.updateOne(
      {
        title: electionTitle,
        "categories.title": categoryTitle,
        "categories.nominees.name": originalName,
      },
      {
        $set: {
          "categories.$[cat].nominees.$[nom].name": newName,
          "categories.$[cat].nominees.$[nom].photo": photoUrl || null, // Changed to null
          "categories.$[cat].nominees.$[nom].logo": logoUrl || null, // Changed to null
        },
      },
      {
        arrayFilters: [
          { "cat.title": categoryTitle },
          { "nom.name": originalName },
        ],
      }
    );
    if (result.matchedCount === 0) {
      if (uploadedFiles.length > 0) {
        await supabase.storage.from("election").remove(uploadedFiles);
      }
      return { error: "Candidate, category, or election not found" };
    }
    console.log(
      "Updated candidate:",
      originalName,
      "to",
      newName,
      "in category:",
      categoryTitle
    );
    return { message: "Candidate updated successfully" };
  } catch (error) {
    console.error("Error updating candidate:", error.stack);
    return { error: "Failed to update candidate: " + error.message };
  }
}

export async function deleteCandidate({
  electionTitle,
  categoryTitle,
  candidateName,
}) {
  try {
    await connectDB();
    const result = await ElectionModel.updateOne(
      { title: electionTitle, "categories.title": categoryTitle },
      { $pull: { "categories.$.nominees": { name: candidateName } } }
    );
    if (result.matchedCount === 0) {
      return { error: "Candidate, category, or election not found" };
    }
    console.log(
      "Deleted candidate:",
      candidateName,
      "from category:",
      categoryTitle,
      "in",
      electionTitle
    );
    return { message: "Candidate deleted successfully" };
  } catch (error) {
    console.error("Error deleting candidate:", error.stack);
    return { error: "Failed to delete candidate: " + error.message };
  }
}

export async function submitVotes(formData) {
  try {
    const votes = JSON.parse(formData.get("votes"));

    if (!Array.isArray(votes) || votes.length === 0) {
      console.error(
        "Invalid vote submission: Expected non-empty array, received:",
        votes.length
      );
      return { error: "Valid votes are required" };
    }

    await connectDB();
    const electionTitle = votes[0]?.electionTitle;
    const election = await ElectionModel.findOne({
      title: { $regex: new RegExp(`^${electionTitle}$`, "i") },
    });
    if (!election) {
      return { error: "Election not found" };
    }

    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    const validCategories = categories.map((cat) => cat.title);
    const invalidVotes = votes.filter(
      (v) =>
        !validCategories.includes(v.categoryTitle) ||
        v.electionTitle !== electionTitle
    );

    if (invalidVotes.length > 0) {
      console.error(
        "Invalid vote submission: Some categories or election titles are invalid",
        invalidVotes
      );
      return {
        error: "All votes must correspond to valid categories in the election",
      };
    }

    if (votes.length !== validCategories.length) {
      console.error(
        "Invalid vote submission: Expected votes for all categories, received:",
        votes.length,
        "expected:",
        validCategories.length
      );
      return { error: `Exactly ${validCategories.length} votes are required` };
    }

    console.log("Processing votes:", votes);

    await Promise.all(
      votes.map(async (vote) => {
        const { categoryTitle, nomineeName } = vote;
        const result = await ElectionModel.updateOne(
          {
            title: electionTitle,
            "categories.title": categoryTitle,
            "categories.nominees.name": nomineeName,
          },
          { $inc: { "categories.$[cat].nominees.$[nom].votes": 1 } },
          {
            arrayFilters: [
              { "cat.title": categoryTitle },
              { "nom.name": nomineeName },
            ],
          }
        );
        if (result.matchedCount === 0) {
          console.error(
            `No match found for election: ${electionTitle}, category: ${categoryTitle}, nominee: ${nomineeName}`
          );
        }
      })
    );

    console.log("Votes submitted successfully");
    return { message: "Votes submitted successfully" };
  } catch (error) {
    console.error("Error submitting votes:", error.stack);
    return { error: "Failed to submit votes: " + error.message };
  }
}

export async function getVoterCount(electionTitle) {
  try {
    await connectDB();
    console.log("Fetching voter count for election:", electionTitle);
    const election = await ElectionModel.findOne(
      { title: { $regex: new RegExp(`^${electionTitle}$`, "i") } },
      "categories.nominees.votes"
    );
    if (!election) {
      console.log("Election not found:", electionTitle);
      return { error: "Election not found" };
    }
    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    const totalVotes = categories.reduce((sum, category) => {
      const categoryVotes = Array.isArray(category.nominees)
        ? category.nominees.reduce(
            (voteSum, nominee) => voteSum + (nominee.votes || 0),
            0
          )
        : 0;
      return sum + categoryVotes;
    }, 0);
    const categoryCount = categories.length;
    const voterCount =
      categoryCount > 0 ? Math.floor(totalVotes / categoryCount) : 0;
    console.log(
      "Fetched voter count:",
      voterCount,
      "Total votes:",
      totalVotes,
      "for election:",
      electionTitle
    );
    return { count: voterCount };
  } catch (error) {
    console.error("Error fetching voter count:", error.stack);
    return { error: "Failed to fetch voter count: " + error.message };
  }
}

export async function getElectionWinners(electionTitle) {
  try {
    await connectDB();
    const election = await ElectionModel.findOne(
      { title: { $regex: new RegExp(`^${electionTitle}$`, "i") } },
      "categories"
    );
    if (!election) {
      return { error: "Election not found" };
    }
    const categories = Array.isArray(election.categories)
      ? election.categories
      : [];
    const results = categories.map((category) => {
      const nominees = Array.isArray(category.nominees)
        ? category.nominees
        : [];
      const winner = nominees.reduce(
        (prev, curr) => (curr.votes > prev.votes ? curr : prev),
        { votes: -1, name: "" }
      );
      return {
        title: category.title,
        nominees: nominees.map((nominee) => ({
          name: nominee.name,
          votes: nominee.votes || 0,
          photo: nominee.photo || null, 
          logo: nominee.logo || null, 
        })),
        winner: winner.name || "No nominees",
      };
    });
    console.log("Fetched election results for:", electionTitle, results);
    return { results };
  } catch (error) {
    console.error("Error fetching election results:", error.stack);
    return { error: "Failed to fetch election results: " + error.message };
  }
}