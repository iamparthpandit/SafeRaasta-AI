import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, Linking, ScrollView } from 'react-native';
import { getCurrentUser } from '../services/authService';
import profileService from '../services/profileService.js';
import colors from '../theme/colors';

export default function ProfileModal({ visible, onClose }) {
  const [profile, setProfile] = useState({ name: '', gender: '', phone: '', email: '', emergencyContacts: [] });
  const [loading, setLoading] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    if (visible) loadProfile();
  }, [visible]);

  const loadProfile = async () => {
    const user = getCurrentUser();
    if (!user) {
      setProfile({ name: '', gender: '', phone: '', email: '', emergencyContacts: [] });
      return;
    }
    setLoading(true);
    try {
      const doc = await profileService.getUserProfile(user.uid);
      if (doc) {
        setProfile({
          name: doc.name || '',
          gender: doc.gender || '',
          phone: doc.phone || '',
          email: user.email || '',
          emergencyContacts: doc.emergencyContacts || [],
        });
      } else {
        setProfile({ name: '', gender: '', phone: '', email: user.email || '', emergencyContacts: [] });
      }
    } catch (error) {
      console.error('loadProfile', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Not signed in', 'Please log in to save profile');
      return;
    }
    setLoading(true);
    try {
      await profileService.setUserProfile(user.uid, {
        name: profile.name,
        gender: profile.gender,
        phone: profile.phone,
        emergencyContacts: profile.emergencyContacts,
        email: profile.email,
      });
      Alert.alert('Saved', 'Profile saved successfully');
      onClose && onClose();
    } catch (error) {
      console.error('saveProfile', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const addEmergencyContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Incomplete', 'Please provide name and phone');
      return;
    }
    // Auto-add +91 if number doesn't start with +
    let formattedPhone = newContactPhone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }
    setProfile(prev => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, { name: newContactName.trim(), phone: formattedPhone }] }));
    setNewContactName('');
    setNewContactPhone('');
  };

  const removeContact = (index) => {
    setProfile(prev => ({ ...prev, emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index) }));
  };

  const callNumber = (phone) => {
    if (!phone) return;
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Error', 'Phone call not supported on this device');
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile picture badge */}
            <View style={styles.profileBadge}>
              <Text style={styles.profileEmoji}>👤</Text>
            </View>
            <Text style={styles.header}>My Profile</Text>

            {/* Email row */}
            <View style={styles.fieldCard}>
              <Text style={styles.label}>📧 Email</Text>
              <Text style={styles.valueText}>{profile.email || 'Not set'}</Text>
            </View>

            {/* Name input */}
            <View style={styles.fieldCard}>
              <Text style={styles.label}>👤 Full Name</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(t) => setProfile(p => ({ ...p, name: t }))}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Gender input */}
            <View style={styles.fieldCard}>
              <Text style={styles.label}>⚧ Gender</Text>
              <TextInput
                style={styles.input}
                value={profile.gender}
                onChangeText={(t) => setProfile(p => ({ ...p, gender: t }))}
                placeholder="Male / Female / Other"
                placeholderTextColor="#999"
              />
            </View>

            {/* Phone input */}
            <View style={styles.fieldCard}>
              <Text style={styles.label}>📱 Phone Number</Text>
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(t) => setProfile(p => ({ ...p, phone: t }))}
                placeholder="+91 XXXXXXXXXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            {/* Emergency Contacts Section */}
            <View style={styles.emergencySectionCard}>
              <Text style={styles.sectionTitle}>🚨 Emergency Contacts</Text>
              <Text style={styles.sectionSubtitle}>Add trusted contacts for SOS alerts</Text>

              <FlatList
                data={profile.emergencyContacts}
                keyExtractor={(_, i) => String(i)}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={styles.contactCard}>
                    <View style={styles.contactIconCircle}>
                      <Text style={styles.contactIcon}>👤</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>
                    <View style={styles.contactActions}>
                      <TouchableOpacity onPress={() => callNumber(item.phone)} style={styles.callBtn}>
                        <Text style={styles.callText}>📞</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeContact(index)} style={styles.removeBtn}>
                        <Text style={styles.removeText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No emergency contacts added yet</Text>}
              />

              {/* Add Contact Form */}
              <View style={styles.addContactSection}>
                <Text style={styles.addContactLabel}>Add New Contact</Text>
                <TextInput
                  placeholder="Contact Name"
                  placeholderTextColor="#999"
                  value={newContactName}
                  onChangeText={setNewContactName}
                  style={styles.addInput}
                />
                <View style={styles.phoneInputRow}>
                  <View style={styles.prefixBadge}>
                    <Text style={styles.prefixText}>+91</Text>
                  </View>
                  <TextInput
                    placeholder="Phone Number"
                    placeholderTextColor="#999"
                    value={newContactPhone}
                    onChangeText={setNewContactPhone}
                    style={[styles.addInput, styles.phoneInput]}
                    keyboardType="phone-pad"
                  />
                </View>
                <TouchableOpacity onPress={addEmergencyContact} style={styles.addContactBtn}>
                  <Text style={styles.addContactBtnText}>+ Add Contact</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={saveProfile} style={styles.saveBtn} disabled={loading}>
                <Text style={styles.saveBtnText}>{loading ? 'Saving...' : '💾 Save Profile'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profileBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileEmoji: {
    fontSize: 38,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  valueText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  input: {
    fontSize: 15,
    color: colors.text.primary,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  emergencySectionCard: {
    backgroundColor: '#FEF3F2',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactIcon: {
    fontSize: 22,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callText: {
    fontSize: 18,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 18,
  },
  emptyText: {
    color: colors.text.light,
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
    fontStyle: 'italic',
  },
  addContactSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addContactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  addInput: {
    fontSize: 15,
    color: colors.text.primary,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  prefixBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: -1,
  },
  prefixText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  addContactBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addContactBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});