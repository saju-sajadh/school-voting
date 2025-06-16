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

    if (!Array.isArray(votes) || votes.length === 0) {
      return { error: 'No valid votes provided' };
    }

    await connectDB();

    for (const vote of votes) {
      const { electionTitle, nomineeName } = vote;
      await ElectionModel.updateOne(
        { title: electionTitle, 'nominees.name': nomineeName },
        { $inc: { 'nominees.$.votes': 1 } }
      );
    }

    return { message: 'Votes submitted successfully' };
  } catch (error) {
    console.error('Error submitting votes:', error);
    return { error: 'Failed to submit votes' };
  }
}