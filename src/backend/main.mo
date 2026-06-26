import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type EmailSettings = {
    fullName : Text;
    jobTitle : Text;
    company : Text;
    signOff : Text;
    defaultTone : Text;
    defaultPronouns : Text;
  };

  public type EmailEntry = {
    id : Nat;
    subject : Text;
    recipientName : Text;
    tone : Text;
    emailBody : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module EmailEntry {
    public func compare(entry1 : EmailEntry, entry2 : EmailEntry) : Order.Order {
      Int.compare(entry1.createdAt, entry2.createdAt);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let emailSettings = Map.empty<Principal, EmailSettings>();
  let emailHistory = Map.empty<Principal, List.List<EmailEntry>>();
  let emailIdCounters = Map.empty<Principal, Nat>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Email Settings Functions
  public shared ({ caller }) func saveSettings(settings : EmailSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save settings");
    };
    emailSettings.add(caller, settings);
  };

  public query ({ caller }) func getSettings() : async ?EmailSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access settings");
    };
    emailSettings.get(caller);
  };

  // Email History Functions
  public query ({ caller }) func getHistory() : async [EmailEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access email history");
    };
    switch (emailHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history.toArray().sort() };
    };
  };

  public shared ({ caller }) func saveEmail(subject : Text, recipientName : Text, tone : Text, emailBody : Text) : async EmailEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save emails");
    };

    let id = switch (emailIdCounters.get(caller)) {
      case (null) { 1 };
      case (?counter) { counter + 1 };
    };

    let emailEntry : EmailEntry = {
      id;
      subject;
      recipientName;
      tone;
      emailBody;
      createdAt = Int.abs(id);
    };

    let currentHistory = switch (emailHistory.get(caller)) {
      case (null) { List.empty<EmailEntry>() };
      case (?history) { history };
    };

    currentHistory.add(emailEntry);

    emailHistory.add(caller, currentHistory);
    emailIdCounters.add(caller, id);

    emailEntry;
  };

  public shared ({ caller }) func deleteEmail(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete emails");
    };

    let currentHistory = switch (emailHistory.get(caller)) {
      case (null) { Runtime.trap("No email history found for user") };
      case (?history) { history };
    };

    let filteredHistory = currentHistory.filter(func(email) { email.id != id });
    emailHistory.add(caller, filteredHistory);
  };

  public shared ({ caller }) func clearHistory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear history");
    };
    emailHistory.remove(caller);
    emailIdCounters.remove(caller);
  };

  public query ({ caller }) func hasHistory() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check history");
    };
    emailHistory.containsKey(caller);
  };
};
