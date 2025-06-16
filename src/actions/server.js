'use server';

import { redirect } from 'next/navigation';
import connectDB from '@/dbconfig';
import ElectionModel from '@/models/electionmodel';

export async function createElections() {
  try {
    const elections = [
      {
        title: 'Sports Club Secretary',
        nominees: [
          { name: 'Aaron Shibu Mathew', votes: 0 },
          { name: 'Alwin Raghu Chandra', votes: 0 },
        ],
      },
      {
        title: 'Arts Club Secretary',
        nominees: [
          { name: 'Shalna A S', votes: 0 },
          { name: 'Fathima J S', votes: 0 },
        ],
      },
      {
        title: 'Sports Captain',
        nominees: [
          { name: 'Fahad', votes: 0 },
          { name: 'Nasmal', votes: 0 },
        ],
      },
      {
        title: 'Head Boy',
        nominees: [
          { name: 'Liya Prashand', votes: 0 },
          { name: 'Devipriya B R', votes: 0 },
          { name: 'Serina Jojee', votes: 0 },
        ],
      },
      {
        title: 'Head Girl',
        nominees: [
          { name: 'Sidharth R S', votes: 0 },
          { name: 'Vinayak Suresh', votes: 0 },
        ],
      },
    ];

    await connectDB();

    const missingElections = [];
    for (const election of elections) {
      const exists = await ElectionModel.findOne({ title: election.title });
      if (!exists) {
        missingElections.push(election);
      }
    }

    if (missingElections.length > 0) {
      await ElectionModel.insertMany(missingElections);
      console.log('Inserted missing elections:', missingElections.length);
    }

    return true;
  } catch (error) {
    console.error('Error creating elections:', error);
    return false;
  }
}

export async function submitVotes(formData) {
  try {
    const votes = JSON.parse(formData.get('votes'));

    if (!Array.isArray(votes) || votes.length !== 5) {
      console.error('Invalid vote submission: Expected 5 votes, received:', votes.length);
      return { error: 'Exactly 5 votes are required' };
    }

    await connectDB();

    console.log('Processing votes:', votes);

    await Promise.all(
      votes.map(async (vote) => {
        const { electionTitle, nomineeName } = vote;
        const result = await ElectionModel.updateOne(
          { title: electionTitle, 'nominees.name': nomineeName },
          { $inc: { 'nominees.$.votes': 1 } }
        );
        if (result.matchedCount === 0) {
          console.error(`No match found for election: ${electionTitle}, nominee: ${nomineeName}`);
        }
      })
    );

    console.log('Votes submitted successfully');
    return { message: 'Votes submitted successfully' };
  } catch (error) {
    console.error('Error submitting votes:', error);
    return { error: 'Failed to submit votes: ' + error.message };
  }
}

export async function getVoterCount() {
  try {
    await connectDB();
    const elections = await ElectionModel.find({}, { 'nominees.votes': 1 });
    const totalVotes = elections.reduce((sum, election) => {
      const electionVotes = election.nominees.reduce((voteSum, nominee) => voteSum + (nominee.votes || 0), 0);
      return sum + electionVotes;
    }, 0);
    // Since each voter casts exactly one vote per election (5 elections),
    // the number of voters is the total votes across all nominees divided by 5
    const voterCount = Math.floor(totalVotes / 5);
    console.log('Fetched voter count:', voterCount, 'Total votes:', totalVotes);
    return { count: voterCount };
  } catch (error) {
    console.error('Error fetching voter count:', error);
    return { error: 'Failed to fetch voter count: ' + error.message };
  }
}

export async function getElectionWinners() {
  try {
    await connectDB();
    const elections = await ElectionModel.find({}, { title: 1, nominees: 1 });
    const results = elections.map((election) => {
      const winner = election.nominees.reduce((prev, curr) =>
        curr.votes > prev.votes ? curr : prev
      );
      return {
        title: election.title,
        nominees: election.nominees.map((nominee) => ({
          name: nominee.name,
          votes: nominee.votes,
        })),
        winner: winner.name,
      };
    });
    console.log('Fetched election results:', results);
    return { results };
  } catch (error) {
    console.error('Error fetching election results:', error);
    return { error: 'Failed to fetch election results: ' + error.message };
  }
}